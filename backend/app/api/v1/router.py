from fastapi import APIRouter
from app.api.v1 import (
    prompt,
    image,
    video,
    workflow,
    audio,
    voice,
    tasks,
    router_health,
)

api_router = APIRouter()

# Include module routers
api_router.include_router(prompt.router, prefix="/prompt", tags=["Prompt Engineering"])
api_router.include_router(image.router, prefix="/image", tags=["AI Image Generation"])
api_router.include_router(video.router, prefix="/video", tags=["AI Video Generation"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["One-Click Workflow"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio & Music"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice & TTS"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Task Management"])

# Include router health endpoint
api_router.include_router(router_health.router, prefix="/router", tags=["AI Router Health"])
