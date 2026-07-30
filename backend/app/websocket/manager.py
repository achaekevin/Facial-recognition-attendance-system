from typing import List, Dict, Optional
from fastapi import WebSocket
from loguru import logger
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.monitoring_stats = {
            "active_cameras": 0,
            "offline_cameras": 0,
            "live_detections": 0,
            "active_users": 0,
            "unknown_faces": 0,
            "total_attendance_today": 0,
            "last_update": None
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket Client connected. Active clients: {len(self.active_connections)}")
        
        # Send current stats to newly connected client
        await websocket.send_json({
            "type": "monitoring_stats",
            "data": self.monitoring_stats,
            "timestamp": datetime.now().isoformat()
        })

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket Client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to WebSocket client: {e}")
    
    async def broadcast_camera_status(self, camera_id: str, status: str, location: str = None):
        """Broadcast camera status change"""
        await self.broadcast({
            "type": "camera_status",
            "data": {
                "camera_id": camera_id,
                "status": status,
                "location": location,
                "timestamp": datetime.now().isoformat()
            }
        })
    
    async def broadcast_detection(self, user_id: str, user_name: str, camera_id: str, 
                                  confidence: float, location: str, avatar: str = None):
        """Broadcast face detection event"""
        await self.broadcast({
            "type": "detection",
            "data": {
                "user_id": user_id,
                "user_name": user_name,
                "camera_id": camera_id,
                "confidence": confidence,
                "location": location,
                "avatar": avatar,
                "timestamp": datetime.now().isoformat()
            }
        })
    
    async def broadcast_attendance(self, user_id: str, user_name: str, department: str,
                                   clock_in: str, status: str, confidence: float, 
                                   camera_name: str, location: str, avatar: str = None):
        """Broadcast attendance record"""
        await self.broadcast({
            "type": "attendance",
            "data": {
                "user_id": user_id,
                "user_name": user_name,
                "department": department,
                "clock_in": clock_in,
                "status": status,
                "confidence": confidence,
                "camera_name": camera_name,
                "location": location,
                "avatar": avatar,
                "timestamp": datetime.now().isoformat()
            }
        })
    
    async def broadcast_unknown_face(self, face_id: str, camera_id: str, camera_name: str,
                                     location: str, confidence: float, snapshot_url: str):
        """Broadcast unknown face detection"""
        await self.broadcast({
            "type": "unknown_face",
            "data": {
                "face_id": face_id,
                "camera_id": camera_id,
                "camera_name": camera_name,
                "location": location,
                "confidence": confidence,
                "snapshot_url": snapshot_url,
                "timestamp": datetime.now().isoformat()
            }
        })
    
    async def broadcast_monitoring_stats(self, stats: Dict):
        """Broadcast updated monitoring statistics"""
        self.monitoring_stats = {
            **stats,
            "last_update": datetime.now().isoformat()
        }
        await self.broadcast({
            "type": "monitoring_stats",
            "data": self.monitoring_stats,
            "timestamp": datetime.now().isoformat()
        })
    
    async def broadcast_system_alert(self, alert_type: str, message: str, severity: str = "info"):
        """Broadcast system alerts"""
        await self.broadcast({
            "type": "system_alert",
            "data": {
                "alert_type": alert_type,
                "message": message,
                "severity": severity,
                "timestamp": datetime.now().isoformat()
            }
        })

ws_manager = ConnectionManager()
