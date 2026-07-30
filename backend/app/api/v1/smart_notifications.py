from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from app.database.session import get_db
from app.notifications.notification_engine import notification_engine

router = APIRouter(prefix="/notifications", tags=["smart-notifications"])

class NotificationPreferences(BaseModel):
    late_arrival_enabled: bool = True
    late_arrival_threshold: int = 30
    absence_enabled: bool = True
    absence_check_time: str = "10:00"
    unknown_person_enabled: bool = True
    camera_offline_enabled: bool = True
    email_enabled: bool = True
    sms_enabled: bool = False
    in_app_enabled: bool = True

class SendNotificationRequest(BaseModel):
    notification_type: str
    recipient_id: str
    recipient_email: str
    recipient_phone: Optional[str] = None
    title: str
    message: str
    data: Optional[Dict] = None
    priority: str = "normal"

@router.get("/preferences")
async def get_notification_preferences():
    """
    Get current notification preferences
    """
    return {
        "rules": notification_engine.notification_rules,
        "supported_types": [
            "late_arrival",
            "absence",
            "unknown_person",
            "camera_offline",
            "attendance_correction",
            "leave_approval"
        ],
        "supported_channels": ["email", "sms", "in_app"]
    }

@router.post("/preferences")
async def update_notification_preferences(preferences: NotificationPreferences):
    """
    Update notification preferences
    """
    try:
        # Update late arrival settings
        notification_engine.notification_rules["late_arrival"]["enabled"] = preferences.late_arrival_enabled
        notification_engine.notification_rules["late_arrival"]["threshold_minutes"] = preferences.late_arrival_threshold
        
        # Update absence settings
        notification_engine.notification_rules["absence"]["enabled"] = preferences.absence_enabled
        notification_engine.notification_rules["absence"]["check_time"] = preferences.absence_check_time
        
        # Update other settings
        notification_engine.notification_rules["unknown_person"]["enabled"] = preferences.unknown_person_enabled
        notification_engine.notification_rules["camera_offline"]["enabled"] = preferences.camera_offline_enabled
        
        return {
            "status": "success",
            "message": "Notification preferences updated",
            "preferences": notification_engine.notification_rules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")

@router.post("/send")
async def send_notification(request: SendNotificationRequest):
    """
    Manually send a notification
    """
    try:
        result = await notification_engine.send_notification(
            notification_type=request.notification_type,
            recipient_id=request.recipient_id,
            recipient_email=request.recipient_email,
            recipient_phone=request.recipient_phone,
            title=request.title,
            message=request.message,
            data=request.data,
            priority=request.priority
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")

@router.get("/history")
async def get_notification_history(
    limit: int = Query(50, description="Number of notifications to return"),
    notification_type: Optional[str] = Query(None, description="Filter by type")
):
    """
    Get notification history (mock implementation)
    """
    # In production, this would fetch from a notifications table in the database
    mock_notifications = [
        {
            "id": f"notif-{i}",
            "type": "late_arrival" if i % 3 == 0 else "unknown_person" if i % 3 == 1 else "camera_offline",
            "title": "Late Arrival Notice" if i % 3 == 0 else "Unknown Person Detected" if i % 3 == 1 else "Camera Offline",
            "message": "Sample notification message",
            "recipient_id": f"user-{i}",
            "channels": ["email", "in_app"],
            "status": "sent",
            "priority": "normal",
            "created_at": (datetime.now() - timedelta(hours=i)).isoformat(),
            "read": i > 5
        }
        for i in range(min(limit, 20))
    ]
    
    if notification_type:
        mock_notifications = [n for n in mock_notifications if n["type"] == notification_type]
    
    return {
        "notifications": mock_notifications,
        "count": len(mock_notifications),
        "unread_count": len([n for n in mock_notifications if not n["read"]])
    }

@router.post("/mark-read/{notification_id}")
async def mark_notification_read(notification_id: str):
    """
    Mark notification as read
    """
    return {
        "status": "success",
        "notification_id": notification_id,
        "read": True
    }

@router.post("/mark-all-read")
async def mark_all_notifications_read():
    """
    Mark all notifications as read
    """
    return {
        "status": "success",
        "message": "All notifications marked as read"
    }

@router.get("/statistics")
async def get_notification_statistics(
    days: int = Query(7, description="Number of days to analyze")
):
    """
    Get notification statistics
    """
    try:
        # Mock statistics - in production, query from database
        total_sent = 156
        
        return {
            "total_sent": total_sent,
            "by_type": {
                "late_arrival": 45,
                "absence": 32,
                "unknown_person": 23,
                "camera_offline": 12,
                "attendance_correction": 28,
                "leave_approval": 16
            },
            "by_channel": {
                "email": 98,
                "sms": 34,
                "in_app": 156
            },
            "delivery_rate": {
                "email": 96.5,
                "sms": 98.2,
                "in_app": 100.0
            },
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")
