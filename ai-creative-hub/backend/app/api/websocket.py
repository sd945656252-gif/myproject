"""
WebSocket handler for real-time communication.
"""
import asyncio
import json
from datetime import datetime
from typing import Optional
import uuid

from fastapi import WebSocket, WebSocketDisconnect, Depends
from loguru import logger
from pydantic import BaseModel

from app.core.ai_router import get_router, AIRouter
from app.core.ai_router.base import TaskType


class WebSocketMessage(BaseModel):
    """WebSocket message structure."""

    type: str
    payload: dict
    timestamp: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        # user_id -> list of WebSocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user: {user_id}")

    async def send_personal_message(
        self, message: WebSocketMessage, user_id: str
    ) -> None:
        """Send message to all connections of a user."""
        if user_id in self.active_connections:
            message.timestamp = datetime.utcnow().isoformat()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message.model_dump())
                except Exception as e:
                    logger.error(f"Error sending message: {e}")

    async def broadcast(self, message: WebSocketMessage) -> None:
        """Broadcast message to all connected users."""
        for user_id in self.active_connections:
            await self.send_personal_message(message, user_id)


# Global connection manager
manager = ConnectionManager()


class WebSocketHandler:
    """Handles WebSocket message processing."""

    def __init__(self, ai_router: AIRouter):
        self.ai_router = ai_router
        self.tasks: dict[str, asyncio.Task] = {}

    async def handle_message(
        self,
        user_id: str,
        message: dict,
    ) -> None:
        """Process incoming WebSocket message."""
        msg_type = message.get("type")
        payload = message.get("payload", {})

        if msg_type == "generate":
            await self._handle_generate(user_id, payload)
        elif msg_type == "cancel":
            await self._handle_cancel(user_id, payload)
        elif msg_type == "status":
            await self._handle_status(user_id, payload)
        elif msg_type == "ping":
            await self._handle_ping(user_id)
        else:
            await manager.send_personal_message(
                WebSocketMessage(
                    type="error",
                    payload={"error": f"Unknown message type: {msg_type}"},
                ),
                user_id,
            )

    async def _handle_generate(self, user_id: str, payload: dict) -> None:
        """Handle generation request."""
        task_type_str = payload.get("task_type")
        params = payload.get("params", {})
        request_id = payload.get("request_id", str(uuid.uuid4()))

        try:
            task_type = TaskType(task_type_str)
        except ValueError:
            await manager.send_personal_message(
                WebSocketMessage(
                    type="error",
                    payload={
                        "request_id": request_id,
                        "error": f"Invalid task type: {task_type_str}",
                    },
                ),
                user_id,
            )
            return

        # Send generation started notification
        await manager.send_personal_message(
            WebSocketMessage(
                type="generation_started",
                payload={
                    "request_id": request_id,
                    "task_type": task_type_str,
                },
            ),
            user_id,
        )

        # Run generation in background
        task = asyncio.create_task(
            self._run_generation(user_id, request_id, task_type, params)
        )
        self.tasks[request_id] = task

    async def _run_generation(
        self,
        user_id: str,
        request_id: str,
        task_type: TaskType,
        params: dict,
    ) -> None:
        """Run generation and send progress updates."""
        try:
            # Send progress updates
            await manager.send_personal_message(
                WebSocketMessage(
                    type="progress",
                    payload={
                        "request_id": request_id,
                        "progress": 10,
                        "status": "validating",
                    },
                ),
                user_id,
            )

            # Execute generation
            result, notification = await self.ai_router.generate(
                task_type, validate=True, **params
            )

            # Send completion
            if result.success:
                await manager.send_personal_message(
                    WebSocketMessage(
                        type="generation_complete",
                        payload={
                            "request_id": request_id,
                            "data": result.data,
                            "provider": result.provider.value if result.provider else None,
                            "model": result.model,
                            "notification": notification,
                        },
                    ),
                    user_id,
                )
            else:
                await manager.send_personal_message(
                    WebSocketMessage(
                        type="generation_failed",
                        payload={
                            "request_id": request_id,
                            "error": result.error,
                            "fallback_used": result.fallback_used,
                        },
                    ),
                    user_id,
                )

        except Exception as e:
            logger.error(f"Generation error: {e}")
            await manager.send_personal_message(
                WebSocketMessage(
                    type="generation_failed",
                    payload={
                        "request_id": request_id,
                        "error": str(e),
                    },
                ),
                user_id,
            )
        finally:
            if request_id in self.tasks:
                del self.tasks[request_id]

    async def _handle_cancel(self, user_id: str, payload: dict) -> None:
        """Handle task cancellation."""
        request_id = payload.get("request_id")

        if request_id and request_id in self.tasks:
            self.tasks[request_id].cancel()
            del self.tasks[request_id]

            await manager.send_personal_message(
                WebSocketMessage(
                    type="cancelled",
                    payload={"request_id": request_id},
                ),
                user_id,
            )

    async def _handle_status(self, user_id: str, payload: dict) -> None:
        """Handle status check."""
        await manager.send_personal_message(
            WebSocketMessage(
                type="status",
                payload={
                    "active_tasks": list(self.tasks.keys()),
                    "connected": True,
                },
            ),
            user_id,
        )

    async def _handle_ping(self, user_id: str) -> None:
        """Handle ping message."""
        await manager.send_personal_message(
            WebSocketMessage(
                type="pong",
                payload={},
            ),
            user_id,
        )


async def get_websocket_handler() -> WebSocketHandler:
    """Get WebSocket handler with AI router."""
    ai_router = await get_router()
    return WebSocketHandler(ai_router)
