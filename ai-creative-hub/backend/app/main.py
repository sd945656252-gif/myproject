"""
AI Creative Hub - FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import settings
from app.database import init_db, close_db
from app.api.v1 import api_router
from app.api.websocket import (
    manager as ws_manager,
    get_websocket_handler,
    WebSocketHandler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Initialize AI Router
    from app.core.ai_router import get_router
    await get_router()
    logger.info("AI Router initialized")

    yield

    # Shutdown
    logger.info("Shutting down...")
    await close_db()
    logger.info("Database connections closed")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Creative Hub - 全能 AI 创作工作站 API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication."""
    await ws_manager.connect(websocket, user_id)
    handler = await get_websocket_handler()

    try:
        while True:
            # Receive message
            data = await websocket.receive_text()

            try:
                message = eval(data) if isinstance(data, str) else data
                await handler.handle_message(user_id, message)
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "payload": {"error": str(e)},
                })

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, user_id)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running",
        "websocket": "/ws/{user_id}",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
