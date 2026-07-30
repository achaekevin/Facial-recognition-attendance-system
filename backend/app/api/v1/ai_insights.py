"""
AI-powered attendance insights API endpoints.
Provides predictions, analytics, and recommendations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.models import AttendanceModel, UserModel
from app.authorization.rbac import get_current_user
from app.ai.attendance_predictor import AttendancePredictor

router = APIRouter(prefix="/ai-insights", tags=["AI Insights"])

# Initialize AI predictor
predictor = AttendancePredictor()


@router.get("/overview")
async def get_ai_overview(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get overall AI-powered attendance insights and health metrics.
    """
    try:
        # Fetch all attendance records (last 90 days)
        cutoff_date = datetime.now() - timedelta(days=90)
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.attendance_date >= cutoff_date.date())
        )
        attendance_records = result.scalars().all()
        
        # Fetch all users
        users_result = await db.execute(select(UserModel))
        users = users_result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "user_id": r.user_id,
                "attendance_date": r.attendance_date,
                "attendance_status": r.attendance_status,
                "total_hours": r.total_hours,
                "clock_in": str(r.clock_in) if r.clock_in else None
            }
            for r in attendance_records
        ]
        
        users_dict = [
            {
                "id": u.id,
                "name": getattr(u, 'name', 'Unknown'),
                "department_name": getattr(u, 'department_name', 'Unknown')
            }
            for u in users
        ]
        
        # Calculate overall insights
        insights = predictor.calculate_overall_insights(records_dict, users_dict)
        
        # Get department trends
        dept_trends = predictor.analyze_department_trends(records_dict, users_dict)
        
        return {
            "success": True,
            "data": {
                "overall_metrics": insights,
                "department_trends": dept_trends[:5],  # Top 5 departments
                "analysis_period": {
                    "start_date": cutoff_date.date().isoformat(),
                    "end_date": datetime.now().date().isoformat(),
                    "days": 90
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating insights: {str(e)}")


@router.get("/user/{user_id}/analysis")
async def get_user_analysis(
    user_id: str,
    days: int = Query(default=30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get detailed AI analysis for a specific user.
    """
    try:
        # Fetch user
        user_result = await db.execute(select(UserModel).where(UserModel.id == user_id))
        user = user_result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Fetch user's attendance records
        cutoff_date = datetime.now() - timedelta(days=days)
        result = await db.execute(
            select(AttendanceModel).where(
                and_(
                    AttendanceModel.user_id == user_id,
                    AttendanceModel.attendance_date >= cutoff_date.date()
                )
            ).order_by(AttendanceModel.attendance_date.desc())
        )
        records = result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "user_id": r.user_id,
                "attendance_date": r.attendance_date,
                "attendance_status": r.attendance_status,
                "total_hours": r.total_hours,
                "clock_in": str(r.clock_in) if r.clock_in else None
            }
            for r in records
        ]
        
        # Analyze attendance
        analysis = predictor.analyze_user_attendance(records_dict)
        
        # Generate recommendations
        user_name = getattr(user, 'name', 'User')
        recommendations = predictor.generate_recommendations(analysis, user_name)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user.id,
                    "name": user_name,
                    "department": getattr(user, 'department_name', 'Unknown'),
                    "role": getattr(user, 'role', 'Unknown')
                },
                "analysis": analysis,
                "recommendations": recommendations,
                "analysis_period": {
                    "days": days,
                    "start_date": cutoff_date.date().isoformat(),
                    "end_date": datetime.now().date().isoformat()
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing user: {str(e)}")


@router.get("/chronic-late-arrivals")
async def get_chronic_late_arrivals(
    days: int = Query(default=30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Identify users with chronic late arrival patterns.
    """
    try:
        # Fetch attendance records
        cutoff_date = datetime.now() - timedelta(days=days)
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.attendance_date >= cutoff_date.date())
        )
        records = result.scalars().all()
        
        # Fetch users
        users_result = await db.execute(select(UserModel))
        users = users_result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "user_id": r.user_id,
                "attendance_status": r.attendance_status
            }
            for r in records
        ]
        
        users_dict = [
            {
                "id": u.id,
                "name": getattr(u, 'name', 'Unknown'),
                "department_name": getattr(u, 'department_name', 'Unknown')
            }
            for u in users
        ]
        
        # Identify late arrivals
        late_users = predictor.identify_late_arrivals(records_dict, users_dict)
        
        return {
            "success": True,
            "data": {
                "late_arrivals": late_users,
                "total_identified": len(late_users),
                "analysis_period": {
                    "days": days,
                    "start_date": cutoff_date.date().isoformat(),
                    "end_date": datetime.now().date().isoformat()
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error identifying late arrivals: {str(e)}")


@router.get("/department-trends")
async def get_department_trends(
    days: int = Query(default=30, ge=7, le=180),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Analyze attendance trends by department.
    """
    try:
        # Fetch attendance records
        cutoff_date = datetime.now() - timedelta(days=days)
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.attendance_date >= cutoff_date.date())
        )
        records = result.scalars().all()
        
        # Fetch users
        users_result = await db.execute(select(UserModel))
        users = users_result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "user_id": r.user_id,
                "attendance_status": r.attendance_status
            }
            for r in records
        ]
        
        users_dict = [
            {
                "id": u.id,
                "name": getattr(u, 'name', 'Unknown'),
                "department_name": getattr(u, 'department_name', 'Unknown')
            }
            for u in users
        ]
        
        # Analyze trends
        trends = predictor.analyze_department_trends(records_dict, users_dict)
        
        return {
            "success": True,
            "data": {
                "department_trends": trends,
                "total_departments": len(trends),
                "analysis_period": {
                    "days": days,
                    "start_date": cutoff_date.date().isoformat(),
                    "end_date": datetime.now().date().isoformat()
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing departments: {str(e)}")


@router.get("/weekly-forecast")
async def get_weekly_forecast(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Forecast attendance for the upcoming week based on historical patterns.
    """
    try:
        # Fetch historical records (last 90 days)
        cutoff_date = datetime.now() - timedelta(days=90)
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.attendance_date >= cutoff_date.date())
        )
        records = result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "attendance_date": r.attendance_date,
                "attendance_status": r.attendance_status
            }
            for r in records
        ]
        
        # Generate forecast
        forecast = predictor.forecast_weekly_attendance(records_dict)
        
        return {
            "success": True,
            "data": forecast
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")


@router.get("/at-risk-users")
async def get_at_risk_users(
    risk_level: Optional[str] = Query(default=None, regex="^(critical|high|medium)$"),
    days: int = Query(default=30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get list of users at risk of chronic absenteeism.
    """
    try:
        # Fetch attendance records
        cutoff_date = datetime.now() - timedelta(days=days)
        result = await db.execute(
            select(AttendanceModel).where(AttendanceModel.attendance_date >= cutoff_date.date())
        )
        records = result.scalars().all()
        
        # Fetch users
        users_result = await db.execute(select(UserModel))
        users = users_result.scalars().all()
        
        # Group records by user
        from collections import defaultdict
        user_records = defaultdict(list)
        
        for r in records:
            user_records[r.user_id].append({
                "user_id": r.user_id,
                "attendance_date": r.attendance_date,
                "attendance_status": r.attendance_status,
                "total_hours": r.total_hours
            })
        
        # Analyze each user
        at_risk_users = []
        for user in users:
            user_id = user.id
            if user_id in user_records:
                analysis = predictor.analyze_user_attendance(user_records[user_id])
                
                # Filter by risk level if specified
                if risk_level and analysis.get('risk_level') != risk_level:
                    continue
                
                # Include users with medium or higher risk
                if analysis.get('risk_level') in ['critical', 'high', 'medium']:
                    at_risk_users.append({
                        "user_id": user_id,
                        "user_name": getattr(user, 'name', 'Unknown'),
                        "department": getattr(user, 'department_name', 'Unknown'),
                        "risk_level": analysis.get('risk_level'),
                        "attendance_rate": analysis.get('attendance_rate'),
                        "absent_days": analysis.get('absent_days'),
                        "late_days": analysis.get('late_days'),
                        "trend": analysis.get('trend'),
                        "prediction": analysis.get('prediction')
                    })
        
        # Sort by risk level (critical first)
        risk_order = {'critical': 0, 'high': 1, 'medium': 2}
        at_risk_users.sort(key=lambda x: risk_order.get(x['risk_level'], 3))
        
        return {
            "success": True,
            "data": {
                "at_risk_users": at_risk_users,
                "total_count": len(at_risk_users),
                "filter": {
                    "risk_level": risk_level or "all",
                    "days": days
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error identifying at-risk users: {str(e)}")


@router.get("/recommendations/{user_id}")
async def get_user_recommendations(
    user_id: str,
    days: int = Query(default=30, ge=7, le=90),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get AI-powered recommendations for improving a user's attendance.
    """
    try:
        # Fetch user
        user_result = await db.execute(select(UserModel).where(UserModel.id == user_id))
        user = user_result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Fetch user's attendance records
        cutoff_date = datetime.now() - timedelta(days=days)
        result = await db.execute(
            select(AttendanceModel).where(
                and_(
                    AttendanceModel.user_id == user_id,
                    AttendanceModel.attendance_date >= cutoff_date.date()
                )
            )
        )
        records = result.scalars().all()
        
        # Convert to dictionaries
        records_dict = [
            {
                "attendance_date": r.attendance_date,
                "attendance_status": r.attendance_status,
                "total_hours": r.total_hours
            }
            for r in records
        ]
        
        # Analyze and generate recommendations
        analysis = predictor.analyze_user_attendance(records_dict)
        user_name = getattr(user, 'name', 'User')
        recommendations = predictor.generate_recommendations(analysis, user_name)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user.id,
                    "name": user_name
                },
                "recommendations": recommendations,
                "total_recommendations": len(recommendations)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
