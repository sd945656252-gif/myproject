"""
Music Generation API - Module 5
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.ai_router import get_router, AIRouter
from app.core.ai_router.base import TaskType
from app.schemas import (
    ApiResponse,
    MusicGenerateRequest,
    MusicGenerateResponse,
    TaskStatus,
)

router = APIRouter()


@router.post("/generate", response_model=ApiResponse)
async def generate_music(
    request: MusicGenerateRequest,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Generate music based on prompt and style.

    Supports instrumental or with lyrics.
    """
    result, notification = await ai_router.generate(
        TaskType.MUSIC_GENERATE,
        validate=True,
        prompt=request.prompt,
        style=request.style,
        duration=request.duration,
        lyrics=request.lyrics,
        instrumental=request.instrumental,
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error,
        )

    return ApiResponse(
        success=True,
        message=notification or "Music generation started",
        data={"task_id": uuid.uuid4()},
    )


@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: uuid.UUID):
    """
    Get status of an async music generation task.
    """
    return TaskStatus(
        task_id=task_id,
        status="processing",
        progress=30,
    )


@router.get("/styles")
async def list_music_styles():
    """
    List available music styles.
    """
    return {
        "styles": [
            "cinematic",
            "electronic",
            "orchestral",
            "pop",
            "rock",
            "jazz",
            "ambient",
            "hip-hop",
            "classical",
            "folk",
        ]
    }
