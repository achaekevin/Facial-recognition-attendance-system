from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict, List
from app.database.session import get_db
from app.models.models import Attendance, Camera, User, Department

router = APIRouter(prefix="/heatmaps", tags=["heatmaps"])

@router.get("/peak-arrival-times")
async def get_peak_arrival_times(
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get peak arrival times - attendance distribution by hour
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get attendance records grouped by hour
        attendance_by_hour = db.query(
            func.hour(Attendance.clock_in).label('hour'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date,
            Attendance.clock_in.isnot(None)
        ).group_by(
            func.hour(Attendance.clock_in)
        ).all()
        
        # Create hourly distribution
        hourly_data = {hour: 0 for hour in range(24)}
        for record in attendance_by_hour:
            if record.hour is not None:
                hourly_data[record.hour] = record.count
        
        # Format for heatmap
        heatmap_data = [
            {
                "hour": f"{hour:02d}:00",
                "value": count,
                "intensity": min(count / 10, 1.0) if count > 0 else 0  # Normalize to 0-1
            }
            for hour, count in hourly_data.items()
        ]
        
        # Find peak hour
        peak_hour = max(hourly_data.items(), key=lambda x: x[1])
        
        return {
            "heatmap": heatmap_data,
            "peak_hour": f"{peak_hour[0]:02d}:00",
            "peak_count": peak_hour[1],
            "total_arrivals": sum(hourly_data.values()),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching peak arrival times: {str(e)}")


@router.get("/busiest-entrances")
async def get_busiest_entrances(
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get busiest entrances/cameras by attendance count
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get attendance count by camera
        camera_stats = db.query(
            Camera.id,
            Camera.name,
            Camera.location,
            func.count(Attendance.id).label('count')
        ).join(
            Attendance, Attendance.camera_id == Camera.id
        ).filter(
            Attendance.date >= start_date
        ).group_by(
            Camera.id, Camera.name, Camera.location
        ).order_by(
            func.count(Attendance.id).desc()
        ).all()
        
        if not camera_stats:
            return {"entrances": [], "total_cameras": 0}
        
        max_count = camera_stats[0].count if camera_stats else 1
        
        entrance_data = [
            {
                "camera_id": stat.id,
                "camera_name": stat.name,
                "location": stat.location,
                "count": stat.count,
                "intensity": stat.count / max_count,
                "percentage": (stat.count / sum(s.count for s in camera_stats)) * 100
            }
            for stat in camera_stats
        ]
        
        return {
            "entrances": entrance_data,
            "total_cameras": len(entrance_data),
            "busiest": entrance_data[0] if entrance_data else None,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching busiest entrances: {str(e)}")



@router.get("/attendance-by-day")
async def get_attendance_by_day(
    weeks: int = Query(4, description="Number of weeks to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get attendance distribution by day of week
    """
    try:
        start_date = datetime.now().date() - timedelta(weeks=weeks)
        
        # Get attendance count by day of week
        attendance_by_day = db.query(
            func.dayofweek(Attendance.date).label('day_of_week'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(
            func.dayofweek(Attendance.date)
        ).all()
        
        # Map day numbers to names (1=Sunday, 2=Monday, etc.)
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        day_data = {i: 0 for i in range(1, 8)}
        
        for record in attendance_by_day:
            if record.day_of_week:
                day_data[record.day_of_week] = record.count
        
        max_count = max(day_data.values()) if day_data else 1
        
        heatmap_data = [
            {
                "day": day_names[day_num - 1],
                "day_number": day_num,
                "value": count,
                "intensity": count / max_count
            }
            for day_num, count in sorted(day_data.items())
        ]
        
        return {
            "heatmap": heatmap_data,
            "busiest_day": day_names[max(day_data.items(), key=lambda x: x[1])[0] - 1],
            "total_attendance": sum(day_data.values()),
            "period_weeks": weeks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendance by day: {str(e)}")


@router.get("/attendance-by-hour-heatmap")
async def get_attendance_hour_heatmap(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get 2D heatmap: Day of week vs Hour of day
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get attendance by day and hour
        attendance_data = db.query(
            func.dayofweek(Attendance.date).label('day_of_week'),
            func.hour(Attendance.clock_in).label('hour'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date,
            Attendance.clock_in.isnot(None)
        ).group_by(
            func.dayofweek(Attendance.date),
            func.hour(Attendance.clock_in)
        ).all()
        
        # Build 2D matrix
        day_names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        heatmap_matrix = []
        
        max_count = max([r.count for r in attendance_data], default=1)
        
        for day in range(1, 8):  # 1-7 (Sun-Sat)
            day_row = {
                "day": day_names[day - 1],
                "hours": []
            }
            
            for hour in range(24):
                # Find matching record
                count = 0
                for record in attendance_data:
                    if record.day_of_week == day and record.hour == hour:
                        count = record.count
                        break
                
                day_row["hours"].append({
                    "hour": f"{hour:02d}:00",
                    "value": count,
                    "intensity": count / max_count if max_count > 0 else 0
                })
            
            heatmap_matrix.append(day_row)
        
        return {
            "heatmap": heatmap_matrix,
            "max_value": max_count,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching hour heatmap: {str(e)}")


@router.get("/department-activity")
async def get_department_activity(
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get attendance activity by department
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get attendance by department
        dept_stats = db.query(
            Department.id,
            Department.name,
            func.count(Attendance.id).label('attendance_count'),
            func.count(func.distinct(Attendance.user_id)).label('active_users'),
            func.avg(Attendance.confidence_score).label('avg_confidence')
        ).join(
            User, User.department_id == Department.id
        ).join(
            Attendance, Attendance.user_id == User.id
        ).filter(
            Attendance.date >= start_date
        ).group_by(
            Department.id, Department.name
        ).order_by(
            func.count(Attendance.id).desc()
        ).all()
        
        if not dept_stats:
            return {"departments": [], "total_departments": 0}
        
        max_attendance = dept_stats[0].attendance_count if dept_stats else 1
        
        department_data = [
            {
                "department_id": stat.id,
                "department_name": stat.name,
                "attendance_count": stat.attendance_count,
                "active_users": stat.active_users,
                "avg_confidence": round(float(stat.avg_confidence or 0), 2),
                "intensity": stat.attendance_count / max_attendance,
                "engagement_rate": round((stat.active_users / stat.attendance_count * 100), 2) if stat.attendance_count > 0 else 0
            }
            for stat in dept_stats
        ]
        
        return {
            "departments": department_data,
            "total_departments": len(department_data),
            "most_active": department_data[0] if department_data else None,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching department activity: {str(e)}")


@router.get("/daily-trend")
async def get_daily_trend(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get daily attendance trend over time
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get daily attendance counts
        daily_stats = db.query(
            Attendance.date,
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(
            Attendance.date
        ).order_by(
            Attendance.date
        ).all()
        
        trend_data = [
            {
                "date": stat.date.isoformat(),
                "value": stat.count,
                "day_name": stat.date.strftime("%A")
            }
            for stat in daily_stats
        ]
        
        # Calculate average and trend
        total = sum(item['value'] for item in trend_data)
        avg = total / len(trend_data) if trend_data else 0
        
        return {
            "trend": trend_data,
            "average": round(avg, 2),
            "total": total,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching daily trend: {str(e)}")
