import os
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RealtimeServer")

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Connection closed. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting: {message}")
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to a connection: {e}")

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, though we only broadcast FROM server TO client
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/broadcast")
async def broadcast_event(event: dict):
    """
    Internal endpoint for the Bot/PHP backend to trigger an update.
    Expected format: {"type": "UPDATE_FLEET", "message": "...", "cooperativa_id": 1}
    """
    await manager.broadcast(event)
    return {"status": "sent"}

if __name__ == "__main__":
    # Start on port 8000 by default
    uvicorn.run(app, host="0.0.0.0", port=8000)
