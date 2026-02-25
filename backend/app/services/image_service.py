import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task, TaskStatus, TaskType
from app.schemas.image import (
    TextToImageRequest,
    ImageToImageRequest,
    InpaintingRequest,
    ControlNetRequest,
)
from app.core.ai_router import AIRouter, TaskType as RouterTaskType
from loguru import logger


class ImageService:
    def __init__(self, db: AsyncSession, router: AIRouter = None):
        self.db = db
        self.router = router

    async def _get_router(self) -> AIRouter:
        """Get or create router instance"""
        if self.router is None:
            from app.core.ai_router import get_router
            self.router = await get_router()
        return self.router

    async def _create_task(
        self,
        task_type: TaskType,
        input_data: dict,
    ) -> str:
        """Create a new task"""
        task = Task(
            id=str(uuid.uuid4()),
            user_id="default_user",  # TODO: Get from auth
            task_type=task_type,
            status=TaskStatus.PENDING,
            input_data=input_data,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return str(task.id)

    async def text_to_image(self, request: TextToImageRequest) -> str:
        """Generate image from text using AI Router"""
        try:
            router = await self._get_router()

            # Prepare parameters for router
            params = {
                "prompt": request.prompt,
                "negative_prompt": request.negative_prompt,
                "width": request.width,
                "height": request.height,
                "steps": request.steps,
                "cfg_scale": request.cfg_scale,
                "num_images": request.num_images,
            }

            if request.seed:
                params["seed"] = request.seed

            # Route to best provider
            result = await router.route(
                task_type=RouterTaskType.IMAGE_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            # Create task record
            task_id = await self._create_task(
                TaskType.IMAGE_GENERATION,
                {"type": "text_to_image", **request.model_dump()}
            )

            # Update task with result (in production, this would be done by Celery)
            # For now, we're doing synchronous for demonstration
            logger.info(f"Image generation completed: {task_id}")
            logger.info(f"Provider used: {result.get('routing', {}).get('provider')}")
            logger.info(f"Images generated: {len(result.get('images', []))}")

            return task_id

        except Exception as e:
            logger.error(f"Text-to-image generation failed: {str(e)}")
            raise

    async def image_to_image(self, request: ImageToImageRequest) -> str:
        """Generate image from image using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "source_image": str(request.source_image_url),
                "prompt": request.prompt,
                "strength": request.strength,
                "negative_prompt": request.negative_prompt,
                "steps": request.steps,
                "cfg_scale": request.cfg_scale,
            }

            if request.seed:
                params["seed"] = request.seed

            result = await router.route(
                task_type=RouterTaskType.IMAGE_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.IMAGE_GENERATION,
                {"type": "image_to_image", **request.model_dump()}
            )

            logger.info(f"Image-to-image completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Image-to-image generation failed: {str(e)}")
            raise

    async def inpainting(self, request: InpaintingRequest) -> str:
        """Image inpainting using AI Router"""
        try:
            router = await self._get_router()

            # For inpainting, we need a provider that supports it
            # Currently, HuggingFace has inpainting models
            params = {
                "image_url": str(request.image_url),
                "mask_url": str(request.mask_url),
                "prompt": request.prompt,
                "negative_prompt": request.negative_prompt,
                "strength": request.strength,
            }

            result = await router.route(
                task_type=RouterTaskType.IMAGE_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.IMAGE_GENERATION,
                {"type": "inpainting", **request.model_dump()}
            )

            logger.info(f"Inpainting completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Inpainting failed: {str(e)}")
            raise

    async def controlnet(self, request: ControlNetRequest) -> str:
        """ControlNet generation using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "source_image": str(request.source_image_url),
                "prompt": request.prompt,
                "control_type": request.control_type,
                "control_weight": request.control_weight,
                "negative_prompt": request.negative_prompt,
                "steps": request.steps,
            }

            result = await router.route(
                task_type=RouterTaskType.IMAGE_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(
                TaskType.IMAGE_GENERATION,
                {"type": "controlnet", **request.model_dump()}
            )

            logger.info(f"ControlNet generation completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"ControlNet generation failed: {str(e)}")
            raise
