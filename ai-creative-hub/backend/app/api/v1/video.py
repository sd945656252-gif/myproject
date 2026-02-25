"""
Video Generation API - Module 3
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from app.core.ai_router import get_router, AIRouter
from app.core.ai_router.base import TaskType
from app.schemas import (
    ApiResponse,
    VideoGenerateRequest,
    VideoGenerateResponse,
    TaskStatus,
)

router = APIRouter()


@router.post("/generate", response_model=ApiResponse)
async def generate_video(
    request: VideoGenerateRequest,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Generate videos from text or images.

    - **text_to_video**: Generate video from text prompt
    - **image_to_video**: Animate a static image
    - **video_to_video**: Transform video style
    """
    task_type_map = {
        "text_to_video": TaskType.TEXT_TO_VIDEO,
        "image_to_video": TaskType.IMAGE_TO_VIDEO,
        "video_to_video": TaskType.VIDEO_TO_VIDEO,
    }

    task_type = task_type_map.get(request.type)
    if not task_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid video type: {request.type}",
        )

    # Video generation is always async
    result, notification = await ai_router.generate(
        task_type,
        validate=True,
        prompt=request.prompt,
        image=request.image,
        video=request.video,
        duration=request.duration,
        fps=request.fps,
        width=request.width,
        height=request.height,
        style=request.style,
        model=request.model,
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error,
        )

    return ApiResponse(
        success=True,
        message=notification or "Video generation started",
        data={"task_id": uuid.uuid4()},  # TODO: Return actual task ID
    )


@router.post("/upscale", response_model=ApiResponse)
async def upscale_video(
    video: UploadFile = File(...),
    scale: int = 2,
    ai_router: AIRouter = Depends(get_router),
):
    """
    Upscale video resolution using AI.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Video upscaling not yet implemented",
    )


@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: uuid.UUID):
    """
    Get status of an async video generation task.
    """
    # TODO: Implement actual task status lookup
    return TaskStatus(
        task_id=task_id,
        status="processing",
        progress=50,
    )


@router.get("/models")
async def list_available_models():
    """
    List available video generation models.
    """
    return {
        "models": [
            {"id": "seedance-2.0", "name": "即梦 Seedance 2.0", "provider": "jimeng"},
            {"id": "kling-3.0", "name": "可灵 3.0", "provider": "kling"},
            {"id": "kling-o1", "name": "可灵 o1", "provider": "kling"},
            {"id": "vidu-1.0", "name": "Vidu", "provider": "vidu"},
            {"id": "sora", "name": "Sora", "provider": "openai"},
            {"id": "veo", "name": "Veo", "provider": "google"},
        ]
    }
