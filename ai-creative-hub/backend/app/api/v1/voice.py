"""
Voice Synthesis API - Module 6
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from app.core.ai_router import get_router, AIRouter
from app.core.ai_router.base import TaskType
from app.schemas import (
    ApiResponse,
    VoiceGenerateRequest,
    VoiceGenerateResponse,
    TaskStatus,
)

router = APIRouter()


@router.post("/synthesize", response_model=ApiResponse)
async def synthesize_voice(
    request: VoiceGenerateRequest,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Synthesize voice from text.

    Supports custom voice ID, speed, pitch, and emotion.
    """
    result, notification = await ai_router.generate(
        TaskType.VOICE_SYNTHESIZE,
        validate=True,
        text=request.text,
        voice_id=request.voice_id,
        speed=request.speed,
        pitch=request.pitch,
        emotion=request.emotion,
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error,
        )

    return ApiResponse(
        success=True,
        message=notification,
        data={"task_id": uuid.uuid4(), "audio_url": result.data.get("audio_url")},
    )


@router.post("/clone", response_model=ApiResponse)
async def clone_voice(
    name: str,
    reference_audio: UploadFile = File(...),
    ai_router: AIRouter = Depends(get_router),
):
    """
    Clone a voice from reference audio.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Voice cloning not yet implemented",
    )


@router.get("/voices")
async def list_available_voices():
    """
    List available voice IDs for synthesis.
    """
    return {
        "voices": [
            {"id": "voice_1", "name": "Standard Male", "gender": "male", "language": "zh"},
            {"id": "voice_2", "name": "Standard Female", "gender": "female", "language": "zh"},
            {"id": "voice_3", "name": "Narrator", "gender": "male", "language": "zh"},
            {"id": "voice_4", "name": "Young Male", "gender": "male", "language": "zh"},
            {"id": "voice_5", "name": "Young Female", "gender": "female", "language": "zh"},
        ]
    }


@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: uuid.UUID):
    """
    Get status of an async voice synthesis task.
    """
    return TaskStatus(
        task_id=task_id,
        status="completed",
        progress=100,
    )
