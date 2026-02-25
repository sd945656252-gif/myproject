import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task, TaskStatus, TaskType
from app.schemas.voice import TTSRequest, VoiceCloneRequest
from app.core.ai_router import AIRouter, TaskType as RouterTaskType
from loguru import logger


class VoiceService:
    def __init__(self, db: AsyncSession, router: AIRouter = None):
        self.db = db
        self.router = router

    async def _get_router(self) -> AIRouter:
        """Get or create router instance"""
        if self.router is None:
            from app.core.ai_router import get_router
            self.router = await get_router()
        return self.router

    async def text_to_speech(self, request: TTSRequest) -> str:
        """Convert text to speech using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "text": request.text,
                "voice": request.voice,
                "model": request.model.value,
                "speed": request.speed,
                "pitch": request.pitch,
                "output_format": request.output_format,
            }

            result = await router.route(
                task_type=RouterTaskType.TTS,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(TaskType.TTS, request.model_dump())

            logger.info(f"TTS completed: {task_id}")
            logger.info(f"Provider used: {result.get('routing', {}).get('provider')}")
            return task_id

        except Exception as e:
            logger.error(f"TTS failed: {str(e)}")
            raise

    async def voice_clone(self, request: VoiceCloneRequest) -> str:
        """Clone voice using AI Router"""
        try:
            router = await self._get_router()

            params = {
                "reference_audio_url": str(request.reference_audio_url),
                "text": request.text,
                "model": request.model.value,
                "speed": request.speed,
                "output_format": request.output_format,
            }

            result = await router.route(
                task_type=RouterTaskType.TTS,
                params=params,
                fallback_enabled=True,
            )

            task_id = await self._create_task(TaskType.TTS, request.model_dump())

            logger.info(f"Voice cloning completed: {task_id}")
            return task_id

        except Exception as e:
            logger.error(f"Voice cloning failed: {str(e)}")
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
