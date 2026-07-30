from typing import Dict, List, Optional
from datetime import datetime, time, timedelta
from loguru import logger
from app.websocket.manager import ws_manager

class NotificationEngine:
    """
    Smart notification engine for automated alerts
    """
    
    def __init__(self):
        self.notification_rules = {
            "late_arrival": {
                "enabled": True,
                "threshold_minutes": 30,
                "channels": ["email", "in_app"]
            },
            "absence": {
                "enabled": True,
                "check_time": "10:00",
                "channels": ["email", "in_app"]
            },
            "unknown_person": {
                "enabled": True,
                "channels": ["email", "sms", "in_app"]
            },
            "camera_offline": {
                "enabled": True,
                "channels": ["email", "in_app"]
            },
            "attendance_correction": {
                "enabled": True,
                "channels": ["in_app"]
            },
            "leave_approval": {
                "enabled": True,
                "channels": ["email", "in_app"]
            }
        }
    
    async def send_notification(
        self,
        notification_type: str,
        recipient_id: str,
        recipient_email: str,
        recipient_phone: Optional[str],
        title: str,
        message: str,
        data: Optional[Dict] = None,
        priority: str = "normal"
    ) -> Dict:
        """
        Send notification through configured channels
        """
        try:
            rule = self.notification_rules.get(notification_type)
            if not rule or not rule.get("enabled"):
                return {"status": "skipped", "reason": "notification type disabled"}
            
            channels = rule.get("channels", ["in_app"])
            results = {}
            
            # In-app notification (via WebSocket)
            if "in_app" in channels:
                await self._send_in_app_notification(
                    recipient_id, notification_type, title, message, data, priority
                )
                results["in_app"] = "sent"
            
            # Email notification
            if "email" in channels and recipient_email:
                email_sent = await self._send_email_notification(
                    recipient_email, title, message, data
                )
                results["email"] = "sent" if email_sent else "failed"
            
            # SMS notification
            if "sms" in channels and recipient_phone:
                sms_sent = await self._send_sms_notification(
                    recipient_phone, message
                )
                results["sms"] = "sent" if sms_sent else "failed"
            
            logger.info(f"Notification sent: {notification_type} to {recipient_id}")
            return {
                "status": "success",
                "channels": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return {"status": "error", "error": str(e)}
    
    async def _send_in_app_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict],
        priority: str
    ):
        """
        Send in-app notification via WebSocket
        """
        await ws_manager.broadcast({
            "type": "notification",
            "data": {
                "id": f"notif-{datetime.now().timestamp()}",
                "user_id": user_id,
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "priority": priority,
                "data": data or {},
                "timestamp": datetime.now().isoformat(),
                "read": False
            }
        })
    
    async def _send_email_notification(
        self,
        email: str,
        title: str,
        message: str,
        data: Optional[Dict]
    ) -> bool:
        """
        Send email notification (mock implementation)
        """
        try:
            # Mock email sending
            logger.info(f"Email sent to {email}: {title}")
            # In production, integrate with SendGrid, AWS SES, etc.
            return True
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return False
    
    async def _send_sms_notification(
        self,
        phone: str,
        message: str
    ) -> bool:
        """
        Send SMS notification (mock implementation)
        """
        try:
            # Mock SMS sending
            logger.info(f"SMS sent to {phone}: {message}")
            # In production, integrate with Twilio, AWS SNS, etc.
            return True
        except Exception as e:
            logger.error(f"SMS send failed: {e}")
            return False
    
    async def check_late_arrivals(self, db_session, expected_time: time, current_time: datetime):
        """
        Check for late arrivals and send notifications
        """
        from app.models.models import User, Attendance
        
        try:
            today = current_time.date()
            threshold_minutes = self.notification_rules["late_arrival"]["threshold_minutes"]
            
            # Get users who should have checked in
            users = db_session.query(User).filter(User.status == "active").all()
            
            for user in users:
                # Check if user has attendance today
                attendance = db_session.query(Attendance).filter(
                    Attendance.user_id == user.id,
                    Attendance.date == today
                ).first()
                
                if not attendance and current_time.time() > expected_time:
                    minutes_late = (current_time.time().hour * 60 + current_time.time().minute) - \
                                 (expected_time.hour * 60 + expected_time.minute)
                    
                    if minutes_late >= threshold_minutes:
                        await self.send_notification(
                            notification_type="late_arrival",
                            recipient_id=user.id,
                            recipient_email=user.email,
                            recipient_phone=getattr(user, 'phone', None),
                            title="Late Arrival Notice",
                            message=f"You are {minutes_late} minutes late. Please check in.",
                            data={
                                "expected_time": expected_time.strftime("%H:%M"),
                                "current_time": current_time.strftime("%H:%M"),
                                "minutes_late": minutes_late
                            },
                            priority="high"
                        )
            
        except Exception as e:
            logger.error(f"Error checking late arrivals: {e}")
    
    async def notify_unknown_person(
        self,
        camera_id: str,
        camera_name: str,
        location: str,
        snapshot_url: str,
        confidence: float
    ):
        """
        Send notification for unknown person detection
        """
        # Notify security team (broadcast to all security officers)
        await ws_manager.broadcast_system_alert(
            alert_type="unknown_person_detected",
            message=f"Unknown person detected at {location}",
            severity="warning"
        )
        
        await ws_manager.broadcast_unknown_face(
            face_id=f"unknown-{datetime.now().timestamp()}",
            camera_id=camera_id,
            camera_name=camera_name,
            location=location,
            confidence=confidence,
            snapshot_url=snapshot_url
        )
    
    async def notify_camera_offline(
        self,
        camera_id: str,
        camera_name: str,
        location: str
    ):
        """
        Send notification when camera goes offline
        """
        await ws_manager.broadcast_system_alert(
            alert_type="camera_offline",
            message=f"Camera {camera_name} ({location}) is offline",
            severity="error"
        )

notification_engine = NotificationEngine()
