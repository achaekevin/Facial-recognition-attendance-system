from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from datetime import datetime, timedelta
from typing import Dict, List
from app.database.session import get_db
from app.models.models import Attendance, User

router = APIRouter(prefix="/recognition-accuracy", tags=["recognition-accuracy"])

# In-memory storage for tracking metrics (in production, use database)
recognition_metrics = {
    "failed_recognitions": [],
    "false_positives": [],
    "false_negatives": [],
    "processing_times": []
}

@router.get("/dashboard")
async def get_accuracy_dashboard(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive recognition accuracy dashboard data
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get all recognitions
        recognitions = db.query(Attendance).filter(Attendance.date >= start_date).all()
        
        if not recognitions:
            return {
                "message": "No recognition data available",
                "period_days": days
            }
        
        total = len(recognitions)
        
        # Average confidence score
        avg_confidence = sum(r.confidence_score for r in recognitions if r.confidence_score) / total
        
        # Confidence distribution
        high_confidence = len([r for r in recognitions if r.confidence_score >= 90])
        medium_confidence = len([r for r in recognitions if 70 <= r.confidence_score < 90])
        low_confidence = len([r for r in recognitions if r.confidence_score < 70])
        
        # Success rate (high + medium confidence)
        success_rate = ((high_confidence + medium_confidence) / total * 100) if total > 0 else 0
        
        # Failed recognitions (low confidence)
        failed_count = low_confidence
        
        # Mock false positives/negatives (in production, track manually reported issues)
        false_positives = len(recognition_metrics["false_positives"])
        false_negatives = len(recognition_metrics["false_negatives"])
        
        # Processing time statistics (mock data + real if available)
        processing_times = recognition_metrics["processing_times"]
        if processing_times:
            avg_processing_time = sum(processing_times) / len(processing_times)
            min_processing_time = min(processing_times)
            max_processing_time = max(processing_times)
        else:
            # Mock values
            avg_processing_time = 0.35
            min_processing_time = 0.15
            max_processing_time = 0.85
        
        # Recognition speed (recognitions per minute)
        time_span_hours = days * 24
        recognitions_per_hour = total / time_span_hours if time_span_hours > 0 else 0
        
        # Daily trend
        daily_stats = db.query(
            Attendance.date,
            func.count(Attendance.id).label('count'),
            func.avg(Attendance.confidence_score).label('avg_confidence'),
            func.sum(case((Attendance.confidence_score >= 90, 1), else_=0)).label('high_conf'),
            func.sum(case((Attendance.confidence_score < 70, 1), else_=0)).label('failed')
        ).filter(
            Attendance.date >= start_date
        ).group_by(Attendance.date).all()
        
        daily_trend = [
            {
                "date": stat.date.isoformat(),
                "total": stat.count,
                "avg_confidence": round(float(stat.avg_confidence or 0), 2),
                "success_rate": round((stat.high_conf / stat.count * 100) if stat.count > 0 else 0, 2),
                "failed": stat.failed
            }
            for stat in daily_stats
        ]
        
        return {
            "overview": {
                "average_confidence": round(avg_confidence, 2),
                "success_rate": round(success_rate, 2),
                "total_recognitions": total,
                "failed_recognitions": failed_count,
                "false_positives": false_positives,
                "false_negatives": false_negatives
            },
            "confidence_distribution": {
                "high": {
                    "count": high_confidence,
                    "percentage": round(high_confidence / total * 100, 2)
                },
                "medium": {
                    "count": medium_confidence,
                    "percentage": round(medium_confidence / total * 100, 2)
                },
                "low": {
                    "count": low_confidence,
                    "percentage": round(low_confidence / total * 100, 2)
                }
            },
            "performance": {
                "avg_processing_time": round(avg_processing_time, 3),
                "min_processing_time": round(min_processing_time, 3),
                "max_processing_time": round(max_processing_time, 3),
                "recognitions_per_hour": round(recognitions_per_hour, 2)
            },
            "daily_trend": daily_trend,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating accuracy dashboard: {str(e)}")


@router.get("/confidence-metrics")
async def get_confidence_metrics(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get detailed confidence score metrics
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get confidence scores
        confidence_data = db.query(
            Attendance.confidence_score,
            Attendance.date
        ).filter(
            Attendance.date >= start_date,
            Attendance.confidence_score.isnot(None)
        ).all()
        
        if not confidence_data:
            return {"message": "No confidence data available"}
        
        scores = [c.confidence_score for c in confidence_data]
        
        # Calculate statistics
        avg_score = sum(scores) / len(scores)
        sorted_scores = sorted(scores)
        median_score = sorted_scores[len(sorted_scores) // 2]
        
        # Confidence ranges
        ranges = {
            "95-100": len([s for s in scores if 95 <= s <= 100]),
            "90-95": len([s for s in scores if 90 <= s < 95]),
            "85-90": len([s for s in scores if 85 <= s < 90]),
            "80-85": len([s for s in scores if 80 <= s < 85]),
            "75-80": len([s for s in scores if 75 <= s < 80]),
            "70-75": len([s for s in scores if 70 <= s < 75]),
            "below-70": len([s for s in scores if s < 70])
        }
        
        # Hourly pattern
        hourly_confidence = {}
        for record in confidence_data:
            if hasattr(record, 'date') and record.date:
                # Mock hour extraction (in production, use clock_in time)
                hour = 9  # Default working hour
                if hour not in hourly_confidence:
                    hourly_confidence[hour] = []
                hourly_confidence[hour].append(record.confidence_score)
        
        hourly_avg = {
            str(hour): round(sum(scores) / len(scores), 2)
            for hour, scores in hourly_confidence.items()
        }
        
        return {
            "statistics": {
                "average": round(avg_score, 2),
                "median": round(median_score, 2),
                "min": round(min(scores), 2),
                "max": round(max(scores), 2),
                "total_samples": len(scores)
            },
            "ranges": ranges,
            "hourly_average": hourly_avg,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating confidence metrics: {str(e)}")


@router.get("/failed-recognitions")
async def get_failed_recognitions(
    days: int = Query(30, description="Number of days to analyze"),
    limit: int = Query(50, description="Maximum records to return"),
    db: Session = Depends(get_db)
):
    """
    Get list of failed recognitions (low confidence)
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get low confidence recognitions
        failed = db.query(
            Attendance.id,
            Attendance.user_id,
            Attendance.date,
            Attendance.clock_in,
            Attendance.confidence_score,
            Attendance.camera_id,
            Attendance.recognition_image_url,
            User.name.label('user_name')
        ).join(User).filter(
            Attendance.date >= start_date,
            Attendance.confidence_score < 70
        ).order_by(
            Attendance.date.desc(),
            Attendance.confidence_score.asc()
        ).limit(limit).all()
        
        failed_list = [
            {
                "id": str(f.id),
                "user_id": f.user_id,
                "user_name": f.user_name,
                "date": f.date.isoformat(),
                "time": f.clock_in.isoformat() if f.clock_in else None,
                "confidence_score": round(f.confidence_score, 2),
                "camera_id": f.camera_id,
                "image_url": f.recognition_image_url,
                "reason": "Low confidence" if f.confidence_score < 70 else "Unknown"
            }
            for f in failed
        ]
        
        # Add in-memory failed recognitions
        for failure in recognition_metrics["failed_recognitions"]:
            failed_list.append(failure)
        
        return {
            "failed_recognitions": failed_list[:limit],
            "total_count": len(failed_list),
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting failed recognitions: {str(e)}")


@router.post("/report-false-positive")
async def report_false_positive(
    attendance_id: str,
    reported_by: str,
    actual_person: str = None,
    notes: str = None
):
    """
    Report a false positive (wrong person identified)
    """
    try:
        false_positive = {
            "id": f"FP-{len(recognition_metrics['false_positives']) + 1:06d}",
            "attendance_id": attendance_id,
            "reported_by": reported_by,
            "actual_person": actual_person,
            "notes": notes,
            "reported_at": datetime.now().isoformat(),
            "status": "pending_review"
        }
        
        recognition_metrics["false_positives"].append(false_positive)
        
        return {
            "status": "success",
            "message": "False positive reported",
            "report_id": false_positive["id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reporting false positive: {str(e)}")


@router.post("/report-false-negative")
async def report_false_negative(
    user_id: str,
    date: str,
    reported_by: str,
    notes: str = None
):
    """
    Report a false negative (person not recognized)
    """
    try:
        false_negative = {
            "id": f"FN-{len(recognition_metrics['false_negatives']) + 1:06d}",
            "user_id": user_id,
            "date": date,
            "reported_by": reported_by,
            "notes": notes,
            "reported_at": datetime.now().isoformat(),
            "status": "pending_review"
        }
        
        recognition_metrics["false_negatives"].append(false_negative)
        
        return {
            "status": "success",
            "message": "False negative reported",
            "report_id": false_negative["id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reporting false negative: {str(e)}")


@router.get("/false-positives")
async def get_false_positives():
    """
    Get all reported false positives
    """
    return {
        "false_positives": recognition_metrics["false_positives"],
        "count": len(recognition_metrics["false_positives"])
    }


@router.get("/false-negatives")
async def get_false_negatives():
    """
    Get all reported false negatives
    """
    return {
        "false_negatives": recognition_metrics["false_negatives"],
        "count": len(recognition_metrics["false_negatives"])
    }


@router.get("/processing-performance")
async def get_processing_performance(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get recognition processing performance metrics
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Get recognition count by day
        daily_counts = db.query(
            Attendance.date,
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= start_date
        ).group_by(Attendance.date).all()
        
        # Processing time stats (using in-memory + mock data)
        processing_times = recognition_metrics["processing_times"]
        if not processing_times:
            # Generate mock data
            processing_times = [0.25, 0.30, 0.35, 0.28, 0.42, 0.31, 0.27]
        
        avg_time = sum(processing_times) / len(processing_times)
        
        # Speed metrics
        total_recognitions = sum(d.count for d in daily_counts)
        avg_per_day = total_recognitions / days if days > 0 else 0
        
        # Peak processing time (mock - hour with most recognitions)
        peak_hour = 9  # 9 AM
        
        return {
            "processing_times": {
                "average_seconds": round(avg_time, 3),
                "min_seconds": round(min(processing_times), 3),
                "max_seconds": round(max(processing_times), 3),
                "samples": len(processing_times)
            },
            "throughput": {
                "total_recognitions": total_recognitions,
                "average_per_day": round(avg_per_day, 2),
                "peak_hour": f"{peak_hour:02d}:00",
                "period_days": days
            },
            "daily_counts": [
                {
                    "date": d.date.isoformat(),
                    "count": d.count
                }
                for d in daily_counts
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating processing performance: {str(e)}")


@router.post("/log-processing-time")
async def log_processing_time(processing_time: float):
    """
    Log a recognition processing time (for tracking)
    """
    try:
        recognition_metrics["processing_times"].append(processing_time)
        
        # Keep only last 1000 entries
        if len(recognition_metrics["processing_times"]) > 1000:
            recognition_metrics["processing_times"] = recognition_metrics["processing_times"][-1000:]
        
        return {
            "status": "success",
            "message": "Processing time logged"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging processing time: {str(e)}")


@router.get("/accuracy-trends")
async def get_accuracy_trends(
    days: int = Query(90, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """
    Get accuracy trends over time
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Weekly aggregation
        weekly_stats = db.query(
            func.date_format(Attendance.date, '%Y-%W').label('week'),
            func.count(Attendance.id).label('total'),
            func.avg(Attendance.confidence_score).label('avg_confidence'),
            func.sum(case((Attendance.confidence_score >= 90, 1), else_=0)).label('high_conf'),
            func.sum(case((Attendance.confidence_score < 70, 1), else_=0)).label('failed')
        ).filter(
            Attendance.date >= start_date
        ).group_by('week').all()
        
        trends = []
        for stat in weekly_stats:
            success_rate = (stat.high_conf / stat.total * 100) if stat.total > 0 else 0
            failure_rate = (stat.failed / stat.total * 100) if stat.total > 0 else 0
            
            trends.append({
                "week": stat.week,
                "total_recognitions": stat.total,
                "avg_confidence": round(float(stat.avg_confidence or 0), 2),
                "success_rate": round(success_rate, 2),
                "failure_rate": round(failure_rate, 2)
            })
        
        # Calculate trend direction
        if len(trends) >= 2:
            recent_confidence = trends[-1]["avg_confidence"]
            previous_confidence = trends[-2]["avg_confidence"]
            
            if recent_confidence > previous_confidence + 2:
                trend_direction = "improving"
            elif recent_confidence < previous_confidence - 2:
                trend_direction = "declining"
            else:
                trend_direction = "stable"
        else:
            trend_direction = "insufficient_data"
        
        return {
            "trends": trends,
            "trend_direction": trend_direction,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating accuracy trends: {str(e)}")
