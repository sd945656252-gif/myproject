from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.video import (
    TextToVideoRequest,
    ImageToVideoRequest,
    VideoToVideoRequest,
    VideoUpscalingRequest,
    VideoGenerationResponse,
)
from app.services.video_service import VideoService
from app.utils.file_upload import upload_image, upload_video
from app.config import get_settings

router = APIRouter()

settings = get_settings()


@router.post("/text-to-video", response_model=VideoGenerationResponse)
async def text_to_video(
    request: TextToVideoRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate video from text using AI providers (Sora, Kling, Jimeng)"""
    try:
        service = VideoService(db)
        task_id = await service.text_to_video(request)
        return VideoGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Video generation task queued",
            estimated_time=120  # 2 minutes estimate
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue video generation: {str(e)}"
        )


@router.post("/image-to-video", response_model=VideoGenerationResponse)
async def image_to_video(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    motion_bucket_id: int = Form(127),
    duration: int = Form(4),
    fps: int = Form(8),
    model: str = Form("sora"),
    db: AsyncSession = Depends(get_db),
):
    """Animate image to video"""
    try:
        # Upload image with validation
        image_url = await upload_image(image)

        request = ImageToVideoRequest(
            image_url=image_url,
            prompt=prompt,
            motion_bucket_id=motion_bucket_id,
            duration=duration,
            fps=fps,
            model=model,
        )

        service = VideoService(db)
        task_id = await service.image_to_video(request)
        return VideoGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Image-to-video task queued",
            estimated_time=90
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue image-to-video: {str(e)}"
        )


@router.post("/video-to-video", response_model=VideoGenerationResponse)
async def video_to_video(
    source_video: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.7),
    duration: int = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Apply style transfer to video"""
    try:
        # Upload video with validation
        video_url = await upload_video(source_video)

        request = VideoToVideoRequest(
            source_video_url=video_url,
            prompt=prompt,
            strength=strength,
            duration=duration,
        )

        service = VideoService(db)
        task_id = await service.video_to_video(request)
        return VideoGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Video-to-video task queued",
            estimated_time=180
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue video-to-video: {str(e)}"
        )


@router.post("/upscaling", response_model=VideoGenerationResponse)
async def video_upscaling(
    video: UploadFile = File(...),
    scale_factor: float = Form(2.0),
    target_resolution: str = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Upscale video to higher resolution"""
    try:
        # Upload video with validation
        video_url = await upload_video(video)

        request = VideoUpscalingRequest(
            video_url=video_url,
            scale_factor=scale_factor,
            target_resolution=target_resolution,
        )

        service = VideoService(db)
        task_id = await service.upscaling(request)
        return VideoGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Video upscaling task queued",
            estimated_time=300
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue video upscaling: {str(e)}"
        )


@router.get("/task/{task_id}")
async def get_video_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get video generation task status and results"""
    try:
        from app.services.history_service import HistoryService
        from app.models.task import TaskStatus

        history_service = HistoryService(db)
        task = await history_service.get_task_by_id(task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return {
            "task_id": task["id"],
            "status": task["status"],
            "output_data": task["output_data"],
            "error_message": task.get("error_message"),
            "created_at": task["created_at"],
            "completed_at": task["completed_at"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}"
        )
