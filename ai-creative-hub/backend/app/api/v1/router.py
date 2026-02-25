"""
API v1 Router - Main router aggregating all module routes.
"""
from fastapi import APIRouter

from app.api.v1 import prompt, image, video, workflow, music, voice, auth

api_router = APIRouter()

# Include all module routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(prompt.router, prefix="/prompt", tags=["Prompt Engineering"])
api_router.include_router(image.router, prefix="/image", tags=["Image Generation"])
api_router.include_router(video.router, prefix="/video", tags=["Video Generation"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["One-Click Workflow"])
api_router.include_router(music.router, prefix="/music", tags=["Music Generation"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Synthesis"])
