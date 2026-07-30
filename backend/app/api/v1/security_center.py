from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.database.session import get_db

router = APIRouter(prefix="/security-center", tags=["security-center"])

# In-memory storage for security events
security_events = []
api_logs = []
user_sessions = {}

class SecurityEvent(BaseModel):
    event_type: str  # "failed_login", "spoofing", "unknown_visitor", "camera_tampering", "suspicious_activity"
    severity: str  # "low", "medium", "high", "critical"
    description: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[dict] = None

@router.post("/events")
async def log_security_event(event: SecurityEvent, request: Request):
    """Log a security event"""
    try:
        event_data = {
            "id": f"SEC-{len(security_events) + 1:06d}",
            "event_type": event.event_type,
            "severity": event.severity,
            "description": event.description,
            "user_id": event.user_id,
            "ip_address": event.ip_address or request.client.host,
            "metadata": event.metadata or {},
            "timestamp": datetime.now().isoformat(),
            "resolved": False
        }
        
        security_events.append(event_data)
        
        return {
            "success": True,
            "event_id": event_data["id"],
            "message": "Security event logged successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_security_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
    days: int = 7
):
    """Get security events with filters"""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        filtered_events = []
        for event in security_events:
            event_time = datetime.fromisoformat(event["timestamp"])
            
            if event_time < start_date:
                continue
            
            if event_type and event["event_type"] != event_type:
                continue
            
            if severity and event["severity"] != severity:
                continue
            
            if resolved is not None and event["resolved"] != resolved:
                continue
            
            filtered_events.append(event)
        
        # Sort by timestamp (newest first)
        filtered_events.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "count": len(filtered_events),
            "events": filtered_events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_security_dashboard(days: int = 7):
    """Get security dashboard overview"""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        # Filter recent events
        recent_events = [
            e for e in security_events
            if datetime.fromisoformat(e["timestamp"]) >= start_date
        ]
        
        # Count by type
        by_type = {}
        by_severity = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        unresolved_count = 0
        
        for event in recent_events:
            event_type = event["event_type"]
            by_type[event_type] = by_type.get(event_type, 0) + 1
            by_severity[event["severity"]] += 1
            if not event["resolved"]:
                unresolved_count += 1
        
        # Recent critical events
        critical_events = [
            e for e in recent_events
            if e["severity"] == "critical" and not e["resolved"]
        ][:5]
        
        return {
            "success": True,
            "period_days": days,
            "total_events": len(recent_events),
            "unresolved_events": unresolved_count,
            "by_type": by_type,
            "by_severity": by_severity,
            "critical_events": critical_events,
            "active_sessions": len(user_sessions),
            "api_requests_today": len([l for l in api_logs if datetime.fromisoformat(l["timestamp"]).date() == datetime.now().date()])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events/{event_id}/resolve")
async def resolve_security_event(event_id: str, resolution: str):
    """Mark security event as resolved"""
    try:
        for event in security_events:
            if event["id"] == event_id:
                event["resolved"] = True
                event["resolved_at"] = datetime.now().isoformat()
                event["resolution"] = resolution
                
                return {
                    "success": True,
                    "message": "Event resolved successfully"
                }
        
        raise HTTPException(status_code=404, detail="Event not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api-usage")
async def get_api_usage(hours: int = 24):
    """Get API usage statistics"""
    try:
        start_time = datetime.now() - timedelta(hours=hours)
        
        recent_logs = [
            log for log in api_logs
            if datetime.fromisoformat(log["timestamp"]) >= start_time
        ]
        
        # Count by endpoint
        by_endpoint = {}
        by_method = {}
        by_status = {}
        
        for log in recent_logs:
            endpoint = log["endpoint"]
            by_endpoint[endpoint] = by_endpoint.get(endpoint, 0) + 1
            
            method = log["method"]
            by_method[method] = by_method.get(method, 0) + 1
            
            status = log["status_code"]
            by_status[status] = by_status.get(status, 0) + 1
        
        return {
            "success": True,
            "period_hours": hours,
            "total_requests": len(recent_logs),
            "by_endpoint": by_endpoint,
            "by_method": by_method,
            "by_status": by_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_active_sessions():
    """Get active user sessions"""
    try:
        active_sessions = [
            {
                "session_id": sid,
                "user_id": data["user_id"],
                "ip_address": data["ip_address"],
                "login_time": data["login_time"],
                "last_activity": data["last_activity"],
                "device_info": data.get("device_info", "Unknown")
            }
            for sid, data in user_sessions.items()
        ]
        
        return {
            "success": True,
            "count": len(active_sessions),
            "sessions": active_sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/terminate")
async def terminate_session(session_id: str):
    """Terminate a user session"""
    try:
        if session_id not in user_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        del user_sessions[session_id]
        
        # Log security event
        security_events.append({
            "id": f"SEC-{len(security_events) + 1:06d}",
            "event_type": "session_terminated",
            "severity": "medium",
            "description": f"Session {session_id} was manually terminated",
            "timestamp": datetime.now().isoformat(),
            "resolved": True
        })
        
        return {
            "success": True,
            "message": "Session terminated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
