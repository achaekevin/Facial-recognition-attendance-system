from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Optional
from app.database.session import get_db
from app.offline.sync_manager import sync_manager

router = APIRouter(prefix="/offline-sync", tags=["offline-sync"])

class NetworkStatus(BaseModel):
    is_online: bool

class OfflineAttendance(BaseModel):
    user_id: str
    date: str
    clock_in: Optional[str] = None
    clock_out: Optional[str] = None
    status: str = "present"
    confidence_score: float = 0
    camera_id: Optional[str] = None
    recognition_image_url: Optional[str] = None
    device_used: str = "Offline Mode"

@router.get("/status")
async def get_sync_status():
    """
    Get current offline sync status
    """
    try:
        status = sync_manager.get_queue_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sync status: {str(e)}")

@router.post("/network-status")
async def update_network_status(status: NetworkStatus):
    """
    Update network status and trigger auto-sync if coming online
    """
    try:
        should_sync = sync_manager.set_network_status(status.is_online)
        
        response = {
            "status": "success",
            "is_online": status.is_online,
            "message": f"Network status updated to {'online' if status.is_online else 'offline'}"
        }
        
        if should_sync:
            response["auto_sync_triggered"] = True
            response["message"] += " - Auto-sync will be triggered"
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating network status: {str(e)}")

@router.post("/queue")
async def queue_attendance(attendance: OfflineAttendance):
    """
    Queue attendance record for offline storage
    """
    try:
        result = sync_manager.queue_attendance(attendance.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error queuing attendance: {str(e)}")

@router.get("/queue")
async def get_queue():
    """
    Get all queued records
    """
    try:
        records = sync_manager.get_queued_records()
        return {
            "queue": records,
            "count": len(records)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting queue: {str(e)}")

@router.post("/sync")
async def trigger_sync(db: Session = Depends(get_db)):
    """
    Manually trigger sync of queued records
    """
    try:
        result = await sync_manager.sync_records(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing records: {str(e)}")

@router.delete("/queue/synced")
async def clear_synced():
    """
    Clear synced records from queue
    """
    try:
        result = sync_manager.clear_synced_records()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing synced records: {str(e)}")

@router.get("/history")
async def get_sync_history(limit: int = 50):
    """
    Get sync history
    """
    try:
        history = sync_manager.get_sync_history(limit)
        return {
            "history": history,
            "count": len(history)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sync history: {str(e)}")

@router.get("/health")
async def check_offline_health():
    """
    Health check for offline mode system
    """
    try:
        status = sync_manager.get_queue_status()
        
        health = {
            "status": "healthy",
            "network": "online" if status["is_online"] else "offline",
            "queue_size": status["queue_size"],
            "issues": []
        }
        
        # Check for issues
        if status["failed"] > 0:
            health["issues"].append(f"{status['failed']} records failed to sync")
        
        if status["queue_size"] > 100:
            health["issues"].append(f"Large queue size: {status['queue_size']} records")
            health["status"] = "warning"
        
        if not status["is_online"] and status["queue_size"] > 0:
            health["issues"].append("System offline with queued records")
        
        return health
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking health: {str(e)}")
