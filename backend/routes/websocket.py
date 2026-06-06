from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.websocket_manager import websocket_manager

router = APIRouter(prefix="", tags=["websocket"])


@router.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket) -> None:
    await websocket_manager.connect(websocket)

    try:
        await websocket.send_json(
            {
                "type": "hello",
                "message": "WebSocket connected",
            }
        )

        while True:
            # Keep connection alive; no strict client message contract required.
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception:
        websocket_manager.disconnect(websocket)
