from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.database.session import get_db

router = APIRouter(prefix="/audit-trail", tags=["audit-trail"])

# In-memory storage for audit logs (in production, use dedicated audit database)
audit_logs = []

class AuditEntry(BaseModel):
    action: str
    entity_type: str  # "face", "attendance", "user", "role", "camera", "setting", "report"
    entity_id: Optional[str] = None
    user_id: str
    changes: Optional[dict] = None
    metadata: Optional[dict] = None

@router.post("/log")
async def create_audit_log(entry: AuditEntry, request: Request):
    """Create new audit log entry"""
    try:
        log_entry = {
            "id": f"AUDIT-{len(audit_logs) + 1:08d}",
            "timestamp": datetime.now().isoformat(),
            "action": entry.action,
            "entity_type": entry.entity_type,
            "entity_id": entry.entity_id,
            "user_id": entry.user_id,
            "ip_address": request.client.host,
            "user_agent": request.headers.get("user-agent", "Unknown"),
            "changes": entry.changes or {},
            "metadata": entry.metadata or {}
        }
        
        audit_logs.append(log_entry)
        
        return {
            "success": True,
            "audit_id": log_entry["id"],
            "message": "Audit entry created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_audit_logs(
    user_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    days: int = 7,
    limit: int = 100
):
    """Get audit logs with filters"""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        filtered_logs = []
        for log in audit_logs:
            log_time = datetime.fromisoformat(log["timestamp"])
            
            if log_time < start_date:
                continue
            
            if user_id and log["user_id"] != user_id:
                continue
            
            if entity_type and log["entity_type"] != entity_type:
                continue
            
            if action and log["action"] != action:
                continue
            
            filtered_logs.append(log)
        
        # Sort by timestamp (newest first)
        filtered_logs.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "count": len(filtered_logs[:limit]),
            "total_count": len(filtered_logs),
            "logs": filtered_logs[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics")
async def get_audit_statistics(days: int = 30):
    """Get audit trail statistics"""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        recent_logs = [
            log for log in audit_logs
            if datetime.fromisoformat(log["timestamp"]) >= start_date
        ]
        
        # Count by action
        by_action = {}
        by_entity = {}
        by_user = {}
        
        for log in recent_logs:
            action = log["action"]
            by_action[action] = by_action.get(action, 0) + 1
            
            entity = log["entity_type"]
            by_entity[entity] = by_entity.get(entity, 0) + 1
            
            user = log["user_id"]
            by_user[user] = by_user.get(user, 0) + 1
        
        # Top users
        top_users = sorted(by_user.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "success": True,
            "period_days": days,
            "total_actions": len(recent_logs),
            "by_action": by_action,
            "by_entity_type": by_entity,
            "top_users": [{"user_id": u, "action_count": c} for u, c in top_users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_audit_logs(
    format: str = "json",
    days: int = 30
):
    """Export audit logs"""
    try:
        start_date = datetime.now() - timedelta(days=days)
        
        logs_to_export = [
            log for log in audit_logs
            if datetime.fromisoformat(log["timestamp"]) >= start_date
        ]
        
        if format == "json":
            return {
                "success": True,
                "format": "json",
                "count": len(logs_to_export),
                "data": logs_to_export
            }
        elif format == "csv":
            # In production, generate actual CSV
            return {
                "success": True,
                "format": "csv",
                "message": "CSV export would be generated here"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'json' or 'csv'")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/actions")
async def get_available_actions():
    """Get list of auditable actions"""
    return {
        "success": True,
        "actions": {
            "face_enrollment": ["create", "update", "delete"],
            "attendance": ["clock_in", "clock_out", "update", "correct", "delete"],
            "user": ["create", "update", "delete", "activate", "deactivate"],
            "role": ["assign", "remove", "update"],
            "camera": ["add", "update", "delete", "configure"],
            "settings": ["update", "reset"],
            "report": ["generate", "export", "share"],
            "authentication": ["login", "logout", "password_change", "mfa_enable"]
        }
    }
