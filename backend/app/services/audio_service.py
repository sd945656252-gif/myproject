import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task, TaskStatus, TaskType
from app.schemas.audio import MusicGenerationRequest
from app.core.ai_router import AIRouter, TaskType as RouterTaskType
from loguru import logger


class AudioService:
    def __init__(self, db: AsyncSession, router: AIRouter = None):
        self.db = db
        self.router = router

    async def _get_router(self) -> AIRouter:
        """Get or create router instance"""
        if self.router is None:
            from app.core.ai_router import get_router
            self.router = await get_router()
        return self.router

    async def generate_music(self, request: MusicGenerationRequest) -> str:
        """Generate music using AI Router (Suno)"""
        try:
            router = await self._get_router()

            params = {
                "prompt": request.prompt,
                "style": request.style.value,
                "mood": request.mood.value,
                "duration": request.duration,
                "lyrics": request.lyrics,
                "instrumental": request.instrumental,
                "model": "suno-v3",  # Suno model
            }

            result = await router.route(
                task_type=RouterTaskType.MUSIC_GENERATION,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(TaskType.MUSIC_GENERATION, request.model_dump())

            logger.info(f"Music generation completed: {task_id}")
            logger.info(f"Provider used: {result.get('routing', {}).get('provider')}")
            return task_id

        except Exception as e:
            logger.error(f"Music generation failed: {str(e)}")
            raise

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
