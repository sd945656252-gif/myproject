import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task, TaskStatus, TaskType
from app.schemas.video import (
    TextToVideoRequest,
    ImageToVideoRequest,
    VideoToVideoRequest,
    VideoUpscalingRequest,
)
from app.core.ai_router import AIRouter, TaskType as RouterTaskType
from loguru import logger


class VideoService:
    def __init__(self, db: AsyncSession, router: AIRouter = None):
        self.db = db
        self.router = router

    async def _get_router(self) -> AIRouter:
        """Get or create router instance"""
        if self.router is None:
            from app.core.ai_router import get_router
            self.router = await get_router()
        return self.router

    async def _create_task(self, task_type: TaskType, input_data: dict) -> str:
        """Create a new task"""
        task = Task(
            id=str(uuid.uuid4()),
            user_id="default_user",
            task_type=task_type,
            status=TaskStatus.PENDING,
            input_data=input_data,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return str(task.id)

    async def text_to_video(self, request: TextToVideoRequest) -> str:
        """Generate video from text using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "prompt": request.prompt,
                "negative_prompt": request.negative_prompt,
                "duration": request.duration,
                "fps": request.fps,
                "width": request.width,
                "height": request.height,
                "model": request.model.value,
            }

            if request.seed:
                params["seed"] = request.seed

            result = await router.route(
                task_type=RouterTaskType.VIDEO_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.VIDEO_GENERATION,
                {"type": "text_to_video", **request.model_dump()}
            )

            logger.info(f"Video generation completed: {task_id}")
            logger.info(f"Provider used: {result.get('routing', {}).get('provider')}")
            return task_id

        except Exception as e:
            logger.error(f"Text-to-video generation failed: {str(e)}")
            raise

    async def image_to_video(self, request: ImageToVideoRequest) -> str:
        """Animate image to video using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "source_image": str(request.image_url),
                "prompt": request.prompt,
                "motion_bucket_id": request.motion_bucket_id,
                "duration": request.duration,
                "fps": request.fps,
                "model": request.model.value,
            }

            result = await router.route(
                task_type=RouterTaskType.VIDEO_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.VIDEO_GENERATION,
                {"type": "image_to_video", **request.model_dump()}
            )

            logger.info(f"Image-to-video completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Image-to-video failed: {str(e)}")
            raise

    async def video_to_video(self, request: VideoToVideoRequest) -> str:
        """Video style transfer using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "source_video": str(request.source_video_url),
                "prompt": request.prompt,
                "strength": request.strength,
            }

            if request.duration:
                params["duration"] = request.duration

            result = await router.route(
                task_type=RouterTaskType.VIDEO_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.VIDEO_GENERATION,
                {"type": "video_to_video", **request.model_dump()}
            )

            logger.info(f"Video-to-video completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Video-to-video failed: {str(e)}")
            raise

    async def upscaling(self, request: VideoUpscalingRequest) -> str:
        """Upscale video using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "source_video": str(request.video_url),
                "scale_factor": request.scale_factor,
            }

            if request.target_resolution:
                params["target_resolution"] = request.target_resolution

            result = await router.route(
                task_type=RouterTaskType.VIDEO_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.VIDEO_GENERATION,
                {"type": "upscaling", **request.model_dump()}
            )

            logger.info(f"Video upscaling completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Video upscaling failed: {str(e)}")
            raise
