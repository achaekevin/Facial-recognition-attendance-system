from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/ws", tags=["WebSockets Telemetry"])

@router.websocket("/live-stream")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo heartbeat ping back
            await websocket.send_json({"type": "PONG", "data": "Telemetry Stream Active"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
