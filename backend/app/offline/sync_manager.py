from typing import List, Dict
from datetime import datetime
from loguru import logger
from sqlalchemy.orm import Session

class OfflineSyncManager:
    """
    Manages offline attendance records and syncs them when online
    """
    
    def __init__(self):
        self.pending_queue = []
        self.sync_history = []
        self.is_online = True
    
    def set_network_status(self, is_online: bool):
        """Update network status"""
        previous_status = self.is_online
        self.is_online = is_online
        
        logger.info(f"Network status changed: {'online' if is_online else 'offline'}")
        
        # If we just came online, trigger auto-sync
        if is_online and not previous_status:
            logger.info("Network restored - triggering auto-sync")
            return True  # Signal to trigger sync
        
        return False
    
    def queue_attendance(self, attendance_data: Dict) -> Dict:
        """
        Queue attendance record for offline storage
        """
        try:
            # Add metadata
            queued_record = {
                "id": f"OFFLINE-{len(self.pending_queue) + 1:06d}",
                "data": attendance_data,
                "queued_at": datetime.now().isoformat(),
                "sync_status": "pending",
                "retry_count": 0
            }
            
            self.pending_queue.append(queued_record)
            logger.info(f"Attendance record queued offline: {queued_record['id']}")
            
            return {
                "status": "queued",
                "queue_id": queued_record["id"],
                "queue_position": len(self.pending_queue),
                "message": "Record queued for sync when online"
            }
            
        except Exception as e:
            logger.error(f"Error queuing attendance: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    def get_queue_status(self) -> Dict:
        """Get current queue status"""
        pending = [r for r in self.pending_queue if r["sync_status"] == "pending"]
        syncing = [r for r in self.pending_queue if r["sync_status"] == "syncing"]
        failed = [r for r in self.pending_queue if r["sync_status"] == "failed"]
        
        return {
            "is_online": self.is_online,
            "queue_size": len(self.pending_queue),
            "pending": len(pending),
            "syncing": len(syncing),
            "failed": len(failed),
            "last_sync": self.sync_history[-1] if self.sync_history else None
        }
    
    def get_queued_records(self) -> List[Dict]:
        """Get all queued records"""
        return self.pending_queue.copy()
    
    async def sync_records(self, db: Session) -> Dict:
        """
        Sync all queued records to database
        """
        if not self.is_online:
            return {
                "status": "offline",
                "message": "Cannot sync while offline"
            }
        
        if not self.pending_queue:
            return {
                "status": "success",
                "message": "No records to sync",
                "synced": 0
            }
        
        synced_count = 0
        failed_count = 0
        sync_errors = []
        
        logger.info(f"Starting sync of {len(self.pending_queue)} queued records")
        
        for record in self.pending_queue[:]:  # Copy list to allow modification
            try:
                record["sync_status"] = "syncing"
                
                # Import here to avoid circular dependency
                from app.models.models import AttendanceModel as Attendance, UserModel as User
                
                # Create attendance record
                attendance_data = record["data"]
                
                # Verify user exists
                user = db.query(User).filter(User.id == attendance_data.get("user_id")).first()
                if not user:
                    raise Exception(f"User not found: {attendance_data.get('user_id')}")
                
                # Create attendance record
                attendance = Attendance(
                    user_id=attendance_data.get("user_id"),
                    date=datetime.fromisoformat(attendance_data.get("date")).date(),
                    clock_in=datetime.fromisoformat(attendance_data.get("clock_in")).time() if attendance_data.get("clock_in") else None,
                    clock_out=datetime.fromisoformat(attendance_data.get("clock_out")).time() if attendance_data.get("clock_out") else None,
                    status=attendance_data.get("status", "present"),
                    confidence_score=attendance_data.get("confidence_score", 0),
                    camera_id=attendance_data.get("camera_id"),
                    recognition_image_url=attendance_data.get("recognition_image_url"),
                    device_used=attendance_data.get("device_used", "Offline Mode")
                )
                
                db.add(attendance)
                db.commit()
                
                # Mark as synced
                record["sync_status"] = "synced"
                record["synced_at"] = datetime.now().isoformat()
                
                # Add to sync history
                self.sync_history.append({
                    "queue_id": record["id"],
                    "synced_at": record["synced_at"],
                    "status": "success"
                })
                
                # Remove from queue
                self.pending_queue.remove(record)
                synced_count += 1
                
                logger.info(f"Successfully synced record: {record['id']}")
                
            except Exception as e:
                logger.error(f"Error syncing record {record['id']}: {e}")
                
                record["sync_status"] = "failed"
                record["retry_count"] += 1
                record["last_error"] = str(e)
                
                failed_count += 1
                sync_errors.append({
                    "queue_id": record["id"],
                    "error": str(e)
                })
                
                # Remove from queue if too many retries
                if record["retry_count"] >= 3:
                    logger.warning(f"Record {record['id']} failed after 3 retries, removing from queue")
                    self.pending_queue.remove(record)
        
        result = {
            "status": "completed",
            "synced": synced_count,
            "failed": failed_count,
            "remaining": len(self.pending_queue),
            "errors": sync_errors if sync_errors else None,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Sync completed: {synced_count} synced, {failed_count} failed")
        
        return result
    
    def clear_synced_records(self):
        """Remove synced records from queue"""
        self.pending_queue = [
            r for r in self.pending_queue 
            if r["sync_status"] != "synced"
        ]
        
        return {
            "status": "success",
            "message": "Synced records cleared",
            "remaining": len(self.pending_queue)
        }
    
    def get_sync_history(self, limit: int = 50) -> List[Dict]:
        """Get sync history"""
        return self.sync_history[-limit:] if self.sync_history else []

# Global sync manager instance
sync_manager = OfflineSyncManager()
