from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from datetime import datetime, timedelta, time
from typing import Dict, List
from app.database.session import get_db
from app.models.models import AttendanceModel as Attendance, UserModel as User, CameraModel as Camera, DepartmentModel as Department

router = APIRouter(prefix="/advanced-analytics", tags=["advanced-analytics"])

@router.get("/attendance-rate")
async def get_attendance_rate(
    days: int = Query(30, description="Number of days to analyze"),
    department_id: str = Query(None, description="Filter by department"),
    db: Session = Depends(get_db)
):
    """
    Calculate attendance rate with various breakdowns
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get total expected attendance (active users * working days)
        active_users = db.query(User).filter(User.status == "active")
        if department_id:
            active_users = active_users.filter(User.department_id == department_id)
        total_users = active_users.count()
        
        # Calculate working days (exclude weekends - simple logic)
        working_days = sum(1 for i in range(days) if (datetime.now().date() - timedelta(days=i)).weekday() < 5)
        expected_attendance = total_users * working_days
        
        # Get actual attendance
        query = db.query(Attendance).filter(Attendance.date >= start_date)
        if department_id:
            query = query.join(User).filter(User.department_id == department_id)
        
        actual_attendance = query.count()
        present_count = query.filter(Attendance.status == "present").count()
        late_count = query.filter(Attendance.status == "late").count()
        absent_count = query.filter(Attendance.status == "absent").count()
        
        # Calculate rates
        attendance_rate = (actual_attendance / expected_attendance * 100) if expected_attendance > 0 else 0
        punctuality_rate = (present_count / actual_attendance * 100) if actual_attendance > 0 else 0
        
        # Daily breakdown
        daily_rates = db.query(
            Attendance.date,
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(Attendance.date).all()
        
        daily_trend = [
            {
                "date": rate.date.isoformat(),
                "count": rate.count,
                "rate": (rate.count / total_users * 100) if total_users > 0 else 0
            }
            for rate in daily_rates
        ]
        
        return {
            "overall": {
                "attendance_rate": round(attendance_rate, 2),
                "punctuality_rate": round(punctuality_rate, 2),
                "expected": expected_attendance,
                "actual": actual_attendance,
                "present": present_count,
                "late": late_count,
                "absent": absent_count
            },
            "daily_trend": daily_trend,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating attendance rate: {str(e)}")


@router.get("/recognition-accuracy")
async def get_recognition_accuracy(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Calculate recognition accuracy metrics
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get all recognitions
        recognitions = db.query(Attendance).filter(Attendance.date >= start_date).all()
        
        total = len(recognitions)
        if total == 0:
            return {"message": "No recognition data available"}
        
        # Calculate average confidence
        avg_confidence = sum(r.confidence_score for r in recognitions if r.confidence_score) / total
        
        # Confidence distribution
        high_confidence = len([r for r in recognitions if r.confidence_score >= 90])
        medium_confidence = len([r for r in recognitions if 70 <= r.confidence_score < 90])
        low_confidence = len([r for r in recognitions if r.confidence_score < 70])
        
        # Failed recognitions (low confidence)
        failed = low_confidence
        success_rate = ((high_confidence + medium_confidence) / total * 100) if total > 0 else 0
        
        # Daily confidence trend
        daily_confidence = db.query(
            Attendance.date,
            func.avg(Attendance.confidence_score).label('avg_confidence'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(Attendance.date).all()
        
        confidence_trend = [
            {
                "date": day.date.isoformat(),
                "avg_confidence": round(float(day.avg_confidence or 0), 2),
                "count": day.count
            }
            for day in daily_confidence
        ]
        
        return {
            "overall": {
                "average_confidence": round(avg_confidence, 2),
                "success_rate": round(success_rate, 2),
                "total_recognitions": total,
                "high_confidence": high_confidence,
                "medium_confidence": medium_confidence,
                "low_confidence": low_confidence,
                "failed_recognitions": failed
            },
            "distribution": {
                "high": round(high_confidence / total * 100, 2),
                "medium": round(medium_confidence / total * 100, 2),
                "low": round(low_confidence / total * 100, 2)
            },
            "confidence_trend": confidence_trend,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating recognition accuracy: {str(e)}")


@router.get("/department-rankings")
async def get_department_rankings(
    days: int = Query(30, description="Number of days to analyze"),
    metric: str = Query("attendance_rate", description="Ranking metric"),
    db: Session = Depends(get_db)
):
    """
    Rank departments by various metrics
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get department statistics
        dept_stats = db.query(
            Department.id,
            Department.name,
            func.count(Attendance.id).label('attendance_count'),
            func.count(func.distinct(Attendance.user_id)).label('active_users'),
            func.avg(Attendance.confidence_score).label('avg_confidence'),
            func.sum(case((Attendance.status == 'present', 1), else_=0)).label('punctual_count')
        ).join(
            User, User.department_id == Department.id
        ).join(
            Attendance, Attendance.user_id == User.id
        ).filter(
            Attendance.date >= start_date
        ).group_by(
            Department.id, Department.name
        ).all()
        
        rankings = []
        for stat in dept_stats:
            # Calculate metrics
            total_users = db.query(User).filter(
                User.department_id == stat.id,
                User.status == "active"
            ).count()
            
            working_days = sum(1 for i in range(days) if (datetime.now().date() - timedelta(days=i)).weekday() < 5)
            expected = total_users * working_days
            
            attendance_rate = (stat.attendance_count / expected * 100) if expected > 0 else 0
            punctuality_rate = (stat.punctual_count / stat.attendance_count * 100) if stat.attendance_count > 0 else 0
            
            rankings.append({
                "department_id": stat.id,
                "department_name": stat.name,
                "attendance_count": stat.attendance_count,
                "active_users": stat.active_users,
                "total_users": total_users,
                "attendance_rate": round(attendance_rate, 2),
                "punctuality_rate": round(punctuality_rate, 2),
                "avg_confidence": round(float(stat.avg_confidence or 0), 2)
            })
        
        # Sort by selected metric
        rankings.sort(key=lambda x: x.get(metric, 0), reverse=True)
        
        # Add rank
        for idx, dept in enumerate(rankings, 1):
            dept["rank"] = idx
        
        return {
            "rankings": rankings,
            "metric": metric,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating department rankings: {str(e)}")



@router.get("/camera-performance")
async def get_camera_performance(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Analyze camera performance metrics
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get camera statistics
        camera_stats = db.query(
            Camera.id,
            Camera.name,
            Camera.location,
            Camera.status,
            func.count(Attendance.id).label('recognition_count'),
            func.avg(Attendance.confidence_score).label('avg_confidence'),
            func.sum(case((Attendance.confidence_score >= 90, 1), else_=0)).label('high_quality')
        ).outerjoin(
            Attendance, and_(
                Attendance.camera_id == Camera.id,
                Attendance.date >= start_date
            )
        ).group_by(
            Camera.id, Camera.name, Camera.location, Camera.status
        ).all()
        
        performance_data = []
        for stat in camera_stats:
            quality_rate = (stat.high_quality / stat.recognition_count * 100) if stat.recognition_count > 0 else 0
            
            # Calculate uptime (mock - in production, track actual uptime)
            uptime = 99.5 if stat.status == "online" else 85.2
            
            performance_data.append({
                "camera_id": stat.id,
                "camera_name": stat.name,
                "location": stat.location,
                "status": stat.status,
                "recognition_count": stat.recognition_count or 0,
                "avg_confidence": round(float(stat.avg_confidence or 0), 2),
                "quality_rate": round(quality_rate, 2),
                "uptime": uptime,
                "utilization": "High" if stat.recognition_count > 100 else "Medium" if stat.recognition_count > 50 else "Low"
            })
        
        # Sort by recognition count
        performance_data.sort(key=lambda x: x["recognition_count"], reverse=True)
        
        return {
            "cameras": performance_data,
            "total_cameras": len(performance_data),
            "online_cameras": len([c for c in performance_data if c["status"] == "online"]),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating camera performance: {str(e)}")


@router.get("/average-arrival-time")
async def get_average_arrival_time(
    days: int = Query(30, description="Number of days to analyze"),
    department_id: str = Query(None, description="Filter by department"),
    db: Session = Depends(get_db)
):
    """
    Calculate average arrival time patterns
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get clock-in times
        query = db.query(
            Attendance.clock_in,
            Attendance.date,
            User.department_id
        ).join(User).filter(
            Attendance.date >= start_date,
            Attendance.clock_in.isnot(None)
        )
        
        if department_id:
            query = query.filter(User.department_id == department_id)
        
        clock_ins = query.all()
        
        if not clock_ins:
            return {"message": "No clock-in data available"}
        
        # Convert to minutes since midnight
        arrival_minutes = []
        for record in clock_ins:
            if record.clock_in:
                minutes = record.clock_in.hour * 60 + record.clock_in.minute
                arrival_minutes.append(minutes)
        
        # Calculate statistics
        avg_minutes = sum(arrival_minutes) / len(arrival_minutes)
        avg_hour = int(avg_minutes // 60)
        avg_minute = int(avg_minutes % 60)
        
        # Peak arrival time (most common hour)
        hourly_counts = {}
        for minutes in arrival_minutes:
            hour = minutes // 60
            hourly_counts[hour] = hourly_counts.get(hour, 0) + 1
        
        peak_hour = max(hourly_counts.items(), key=lambda x: x[1])[0] if hourly_counts else 8
        
        # Early vs Late arrivals (assuming 9:00 AM is standard)
        standard_time = 9 * 60  # 9:00 AM in minutes
        early_arrivals = len([m for m in arrival_minutes if m < standard_time])
        on_time = len([m for m in arrival_minutes if standard_time <= m < standard_time + 30])
        late_arrivals = len([m for m in arrival_minutes if m >= standard_time + 30])
        
        return {
            "average_arrival": f"{avg_hour:02d}:{avg_minute:02d}",
            "peak_hour": f"{peak_hour:02d}:00",
            "breakdown": {
                "early": early_arrivals,
                "on_time": on_time,
                "late": late_arrivals,
                "early_percentage": round(early_arrivals / len(arrival_minutes) * 100, 2),
                "on_time_percentage": round(on_time / len(arrival_minutes) * 100, 2),
                "late_percentage": round(late_arrivals / len(arrival_minutes) * 100, 2)
            },
            "total_records": len(arrival_minutes),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating arrival times: {str(e)}")


@router.get("/peak-attendance")
async def get_peak_attendance(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Find peak attendance periods
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Daily peak
        daily_counts = db.query(
            Attendance.date,
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(Attendance.date).all()
        
        if not daily_counts:
            return {"message": "No attendance data available"}
        
        peak_day = max(daily_counts, key=lambda x: x.count)
        
        # Weekly pattern
        weekly_pattern = {}
        for record in daily_counts:
            day_name = record.date.strftime("%A")
            weekly_pattern[day_name] = weekly_pattern.get(day_name, 0) + record.count
        
        peak_weekday = max(weekly_pattern.items(), key=lambda x: x[1])
        
        # Monthly comparison (last 3 months)
        monthly_data = []
        for month_offset in range(3):
            month_start = (datetime.now().replace(day=1) - timedelta(days=month_offset * 30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            count = db.query(func.count(Attendance.id)).filter(
                Attendance.date >= month_start.date(),
                Attendance.date <= month_end.date()
            ).scalar()
            
            monthly_data.append({
                "month": month_start.strftime("%B %Y"),
                "count": count or 0
            })
        
        return {
            "peak_day": {
                "date": peak_day.date.isoformat(),
                "count": peak_day.count,
                "day_name": peak_day.date.strftime("%A")
            },
            "peak_weekday": {
                "day": peak_weekday[0],
                "total_count": peak_weekday[1]
            },
            "weekly_pattern": weekly_pattern,
            "monthly_comparison": monthly_data,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating peak attendance: {str(e)}")


@router.get("/late-trends")
async def get_late_trends(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Analyze late arrival trends
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get late arrivals (assuming >9:30 AM is late)
        late_threshold = time(9, 30)
        
        late_arrivals = db.query(
            Attendance.date,
            Attendance.clock_in,
            User.id,
            User.name,
            User.department_id
        ).join(User).filter(
            Attendance.date >= start_date,
            Attendance.clock_in > late_threshold
        ).all()
        
        # Daily late count
        daily_late = {}
        for record in late_arrivals:
            date_str = record.date.isoformat()
            daily_late[date_str] = daily_late.get(date_str, 0) + 1
        
        daily_trend = [
            {"date": date, "count": count}
            for date, count in sorted(daily_late.items())
        ]
        
        # Repeat offenders
        user_late_counts = {}
        for record in late_arrivals:
            user_late_counts[record.id] = user_late_counts.get(record.id, {"name": record.name, "count": 0})
            user_late_counts[record.id]["count"] += 1
        
        repeat_offenders = sorted(
            [{"user_id": uid, "name": data["name"], "late_count": data["count"]}
             for uid, data in user_late_counts.items()],
            key=lambda x: x["late_count"],
            reverse=True
        )[:10]
        
        # Calculate trend direction
        if len(daily_trend) >= 7:
            recent_avg = sum(d["count"] for d in daily_trend[-7:]) / 7
            older_avg = sum(d["count"] for d in daily_trend[:7]) / 7 if len(daily_trend) >= 14 else recent_avg
            trend_direction = "increasing" if recent_avg > older_avg else "decreasing" if recent_avg < older_avg else "stable"
        else:
            trend_direction = "insufficient_data"
        
        return {
            "total_late_arrivals": len(late_arrivals),
            "daily_trend": daily_trend,
            "trend_direction": trend_direction,
            "repeat_offenders": repeat_offenders,
            "average_daily_late": round(len(late_arrivals) / days, 2),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing late trends: {str(e)}")


@router.get("/comprehensive-summary")
async def get_comprehensive_summary(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get all analytics in one comprehensive summary
    """
    try:
        # This would call all the above endpoints internally
        # For now, return a combined summary
        
        start_date = datetime.now().date() - timedelta(days=days)
        total_attendance = db.query(func.count(Attendance.id)).filter(
            Attendance.date >= start_date
        ).scalar() or 0
        
        avg_confidence = db.query(func.avg(Attendance.confidence_score)).filter(
            Attendance.date >= start_date
        ).scalar() or 0
        
        return {
            "period": f"Last {days} days",
            "summary": {
                "total_attendance": total_attendance,
                "average_confidence": round(float(avg_confidence), 2),
                "total_users": db.query(func.count(User.id)).filter(User.status == "active").scalar(),
                "total_cameras": db.query(func.count(Camera.id)).scalar(),
                "online_cameras": db.query(func.count(Camera.id)).filter(Camera.status == "online").scalar()
            },
            "message": "Use specific endpoints for detailed analytics"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
