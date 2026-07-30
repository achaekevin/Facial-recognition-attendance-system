from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.session import get_db
from app.models.models import AttendanceModel as Attendance, UserModel as User, DepartmentModel as Department, CameraModel as Camera

router = APIRouter(prefix="/ai-reports", tags=["ai-reports"])

@router.get("/generate")
async def generate_ai_report(report_type: str = "monthly", db: Session = Depends(get_db)):
    """
    Generate AI-powered natural language report with insights
    """
    try:
        if report_type == "monthly":
            return await _generate_monthly_report(db)
        elif report_type == "weekly":
            return await _generate_weekly_report(db)
        elif report_type == "department":
            return await _generate_department_report(db)
        elif report_type == "performance":
            return await _generate_performance_report(db)
        else:
            raise HTTPException(status_code=400, detail="Invalid report type")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def _generate_monthly_report(db: Session):
    """Generate monthly summary report"""
    now = datetime.now()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    
    # Current month stats
    current_attendance = db.query(func.count(Attendance.id)).filter(
        Attendance.date >= current_month_start.date()
    ).scalar() or 0
    
    # Last month stats
    last_attendance = db.query(func.count(Attendance.id)).filter(
        Attendance.date >= last_month_start.date(),
        Attendance.date < current_month_start.date()
    ).scalar() or 0
    
    # Calculate change
    if last_attendance > 0:
        change_percent = ((current_attendance - last_attendance) / last_attendance) * 100
    else:
        change_percent = 0
    
    # Department performance
    dept_stats = db.query(
        Department.name,
        func.count(Attendance.id).label('count')
    ).join(User).join(Attendance).filter(
        Attendance.date >= current_month_start.date()
    ).group_by(Department.id).order_by(func.count(Attendance.id).desc()).all()
    
    best_dept = dept_stats[0] if dept_stats else None
    worst_dept = dept_stats[-1] if dept_stats else None
    
    # Camera issues
    camera_stats = db.query(
        Camera.name,
        func.avg(Attendance.confidence_score).label('avg_conf')
    ).join(Attendance).filter(
        Attendance.date >= current_month_start.date()
    ).group_by(Camera.id).order_by(func.avg(Attendance.confidence_score).asc()).all()
    
    problematic_camera = camera_stats[0] if camera_stats and camera_stats[0].avg_conf < 80 else None
    
    # Generate narrative
    trend = "decreased" if change_percent < 0 else "increased"
    narrative = f"Attendance {trend} by {abs(change_percent):.1f}% this month compared to last month. "
    
    if best_dept:
        narrative += f"Department '{best_dept.name}' had the highest attendance rate with {best_dept.count} records. "
    
    if worst_dept and worst_dept != best_dept:
        narrative += f"Department '{worst_dept.name}' recorded the lowest attendance. "
    
    if problematic_camera:
        narrative += f"Camera '{problematic_camera.name}' experienced performance issues with an average confidence of {problematic_camera.avg_conf:.1f}%, which may have affected recognition accuracy."
    
    return {
        "success": True,
        "report_type": "monthly",
        "generated_at": now.isoformat(),
        "narrative": narrative.strip(),
        "metrics": {
            "current_month_attendance": current_attendance,
            "last_month_attendance": last_attendance,
            "change_percent": round(change_percent, 2),
            "best_department": best_dept.name if best_dept else None,
            "worst_department": worst_dept.name if worst_dept else None,
            "problematic_cameras": [problematic_camera.name] if problematic_camera else []
        },
        "insights": [
            f"Attendance {trend} by {abs(change_percent):.1f}%",
            f"Best performer: {best_dept.name}" if best_dept else "No department data",
            f"Camera '{problematic_camera.name}' needs attention" if problematic_camera else "All cameras performing well"
        ]
    }

async def _generate_weekly_report(db: Session):
    """Generate weekly summary report"""
    now = datetime.now()
    week_start = now - timedelta(days=now.weekday())
    
    daily_stats = db.query(
        Attendance.date,
        func.count(Attendance.id).label('count')
    ).filter(
        Attendance.date >= week_start.date()
    ).group_by(Attendance.date).all()
    
    if not daily_stats:
        return {
            "success": True,
            "report_type": "weekly",
            "narrative": "No attendance data available for this week.",
            "metrics": {}
        }
    
    avg_daily = sum(s.count for s in daily_stats) / len(daily_stats)
    peak_day = max(daily_stats, key=lambda x: x.count)
    low_day = min(daily_stats, key=lambda x: x.count)
    
    narrative = f"This week averaged {avg_daily:.0f} attendances per day. "
    narrative += f"Peak attendance was on {peak_day.date.strftime('%A')} with {peak_day.count} records. "
    narrative += f"Lowest attendance was on {low_day.date.strftime('%A')} with {low_day.count} records."
    
    return {
        "success": True,
        "report_type": "weekly",
        "generated_at": now.isoformat(),
        "narrative": narrative,
        "metrics": {
            "average_daily_attendance": round(avg_daily, 2),
            "peak_day": peak_day.date.isoformat(),
            "peak_count": peak_day.count,
            "low_day": low_day.date.isoformat(),
            "low_count": low_day.count
        }
    }

async def _generate_department_report(db: Session):
    """Generate department comparison report"""
    now = datetime.now()
    month_start = now.replace(day=1)
    
    dept_stats = db.query(
        Department.name,
        func.count(Attendance.id).label('attendance'),
        func.avg(Attendance.confidence_score).label('avg_conf'),
        func.count(func.distinct(User.id)).label('employees')
    ).join(User).join(Attendance).filter(
        Attendance.date >= month_start.date()
    ).group_by(Department.id).all()
    
    if not dept_stats:
        return {
            "success": True,
            "report_type": "department",
            "narrative": "No department data available.",
            "metrics": {}
        }
    
    # Calculate rates
    dept_data = []
    for stat in dept_stats:
        rate = (stat.attendance / stat.employees) if stat.employees > 0 else 0
        dept_data.append({
            "name": stat.name,
            "attendance": stat.attendance,
            "employees": stat.employees,
            "rate": rate,
            "confidence": stat.avg_conf or 0
        })
    
    dept_data.sort(key=lambda x: x["rate"], reverse=True)
    best = dept_data[0]
    worst = dept_data[-1]
    
    narrative = f"Department analysis for this month shows {best['name']} leading with {best['rate']:.1f} average attendances per employee, "
    narrative += f"while {worst['name']} had the lowest rate at {worst['rate']:.1f} per employee."
    
    return {
        "success": True,
        "report_type": "department",
        "generated_at": now.isoformat(),
        "narrative": narrative,
        "departments": dept_data
    }

async def _generate_performance_report(db: Session):
    """Generate system performance report"""
    now = datetime.now()
    week_start = now - timedelta(days=7)
    
    total_recognitions = db.query(func.count(Attendance.id)).filter(
        Attendance.date >= week_start.date()
    ).scalar() or 0
    
    avg_confidence = db.query(func.avg(Attendance.confidence_score)).filter(
        Attendance.date >= week_start.date()
    ).scalar() or 0
    
    low_confidence = db.query(func.count(Attendance.id)).filter(
        Attendance.date >= week_start.date(),
        Attendance.confidence_score < 70
    ).scalar() or 0
    
    success_rate = ((total_recognitions - low_confidence) / total_recognitions * 100) if total_recognitions > 0 else 0
    
    narrative = f"Over the past week, the system processed {total_recognitions} recognitions with an average confidence of {avg_confidence:.1f}%. "
    narrative += f"Success rate was {success_rate:.1f}% with {low_confidence} low-confidence recognitions. "
    
    if success_rate >= 95:
        narrative += "System performance is excellent."
    elif success_rate >= 85:
        narrative += "System performance is good but could be improved."
    else:
        narrative += "System performance needs attention."
    
    return {
        "success": True,
        "report_type": "performance",
        "generated_at": now.isoformat(),
        "narrative": narrative,
        "metrics": {
            "total_recognitions": total_recognitions,
            "average_confidence": round(avg_confidence, 2),
            "success_rate": round(success_rate, 2),
            "failed_recognitions": low_confidence
        }
    }

@router.get("/types")
async def get_report_types():
    """Get available AI report types"""
    return {
        "success": True,
        "report_types": [
            {"id": "monthly", "name": "Monthly Summary", "description": "Comprehensive monthly attendance analysis"},
            {"id": "weekly", "name": "Weekly Summary", "description": "Week-over-week attendance trends"},
            {"id": "department", "name": "Department Comparison", "description": "Cross-department performance analysis"},
            {"id": "performance", "name": "System Performance", "description": "Recognition system effectiveness report"}
        ]
    }
