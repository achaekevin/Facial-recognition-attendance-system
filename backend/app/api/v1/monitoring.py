from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List
from app.database.session import get_db
# from app.models.models import UserModel as User, AttendanceModel as Attendance, CameraModel as Camera, UnknownFaceModel as UnknownFace
# Note: Models import commented out temporarily - uncomment when models are available
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/stats")
async def get_monitoring_stats(db: Session = Depends(get_db)):
    """
    Get comprehensive monitoring statistics
    """
    try:
        today = datetime.now().date()
        
        # Get camera statistics
        total_cameras = db.query(Camera).count()
        active_cameras = db.query(Camera).filter(Camera.status == "online").count()
        offline_cameras = total_cameras - active_cameras
        
        # Get user statistics
        total_users = db.query(User).filter(User.status == "active").count()
        
        # Get today's attendance
        today_attendance = db.query(Attendance).filter(
            Attendance.date == today
        ).count()
        
        # Get active users (checked in today)
        active_users_today = db.query(Attendance).filter(
            Attendance.date == today,
            Attendance.status == "present"
        ).distinct(Attendance.user_id).count()
        
        # Get unknown faces count (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        unknown_faces_count = db.query(UnknownFace).filter(
            UnknownFace.captured_at >= yesterday,
            UnknownFace.status == "unassigned"
        ).count()
        
        # Get recent detections (last hour)
        last_hour = datetime.now() - timedelta(hours=1)
        recent_detections = db.query(Attendance).filter(
            Attendance.created_at >= last_hour
        ).count()
        
        # Calculate average confidence
        avg_confidence_result = db.query(Attendance).filter(
            Attendance.date == today
        ).all()
        
        avg_confidence = 0
        if avg_confidence_result:
            confidences = [a.confidence_score for a in avg_confidence_result if a.confidence_score]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        stats = {
            "cameras": {
                "total": total_cameras,
                "active": active_cameras,
                "offline": offline_cameras
            },
            "users": {
                "total": total_users,
                "active_today": active_users_today
            },
            "attendance": {
                "today_total": today_attendance,
                "recent_hour": recent_detections,
                "average_confidence": round(avg_confidence, 2)
            },
            "unknown_faces": {
                "last_24h": unknown_faces_count
            },
            "system": {
                "status": "operational",
                "last_update": datetime.now().isoformat()
            }
        }
        
        # Broadcast updated stats via WebSocket
        await ws_manager.broadcast_monitoring_stats({
            "active_cameras": active_cameras,
            "offline_cameras": offline_cameras,
            "live_detections": recent_detections,
            "active_users": active_users_today,
            "unknown_faces": unknown_faces_count,
            "total_attendance_today": today_attendance
        })
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monitoring stats: {str(e)}")


@router.get("/live-feed")
async def get_live_feed(limit: int = 50, db: Session = Depends(get_db)):
    """
    Get live attendance feed with recent detections
    """
    try:
        # Get recent attendance records
        recent_attendance = db.query(Attendance).order_by(
            Attendance.created_at.desc()
        ).limit(limit).all()
        
        feed = []
        for record in recent_attendance:
            user = db.query(User).filter(User.id == record.user_id).first()
            camera = db.query(Camera).filter(Camera.id == record.camera_id).first()
            
            feed.append({
                "id": record.id,
                "user_id": record.user_id,
                "user_name": user.name if user else "Unknown",
                "user_avatar": user.avatar if user else None,
                "department": user.department.name if user and user.department else "N/A",
                "clock_in": record.clock_in.strftime("%H:%M:%S") if record.clock_in else None,
                "confidence": record.confidence_score,
                "camera_name": camera.name if camera else "Unknown",
                "location": camera.location if camera else "Unknown",
                "status": record.status,
                "timestamp": record.created_at.isoformat()
            })
        
        return {"feed": feed, "count": len(feed)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live feed: {str(e)}")


@router.get("/active-cameras")
async def get_active_cameras(db: Session = Depends(get_db)):
    """
    Get all cameras with their current status and recent activity
    """
    try:
        cameras = db.query(Camera).all()
        
        camera_list = []
        for camera in cameras:
            # Get recent detections for this camera (last hour)
            last_hour = datetime.now() - timedelta(hours=1)
            recent_detections = db.query(Attendance).filter(
                Attendance.camera_id == camera.id,
                Attendance.created_at >= last_hour
            ).count()
            
            camera_list.append({
                "id": camera.id,
                "name": camera.name,
                "location": camera.location,
                "status": camera.status,
                "resolution": camera.resolution,
                "fps": camera.fps,
                "stream_url": camera.stream_url,
                "recent_detections": recent_detections,
                "coordinates": {
                    "x": camera.map_position_x if hasattr(camera, 'map_position_x') else None,
                    "y": camera.map_position_y if hasattr(camera, 'map_position_y') else None
                }
            })
        
        return {"cameras": camera_list, "total": len(camera_list)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cameras: {str(e)}")


@router.get("/unknown-faces-alert")
async def get_unknown_faces_alert(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get recent unknown face detections for monitoring dashboard
    """
    try:
        # Get recent unknown faces (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        unknown_faces = db.query(UnknownFace).filter(
            UnknownFace.captured_at >= yesterday
        ).order_by(
            UnknownFace.captured_at.desc()
        ).limit(limit).all()
        
        alerts = []
        for face in unknown_faces:
            camera = db.query(Camera).filter(Camera.id == face.camera_id).first()
            
            alerts.append({
                "id": face.id,
                "camera_id": face.camera_id,
                "camera_name": camera.name if camera else "Unknown",
                "location": camera.location if camera else "Unknown",
                "confidence_score": face.confidence_score,
                "snapshot_url": face.snapshot_url,
                "status": face.status,
                "captured_at": face.captured_at.isoformat()
            })
        
        return {"alerts": alerts, "count": len(alerts)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching unknown faces: {str(e)}")


@router.post("/trigger-alert")
async def trigger_system_alert(alert_type: str, message: str, severity: str = "info"):
    """
    Manually trigger a system alert to all connected clients
    """
    try:
        await ws_manager.broadcast_system_alert(alert_type, message, severity)
        return {"status": "success", "message": "Alert broadcasted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting alert: {str(e)}")
