"""
Celery tasks for async AI generation.
"""
import asyncio
import uuid
from datetime import datetime
from typing import Optional, Any, Coroutine, TypeVar

from celery import Celery
from loguru import logger

from app.config import settings

T = TypeVar("T")

# Create Celery app
celery_app = Celery(
    "ai_creative_hub",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max
    task_soft_time_limit=540,  # 9 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
)


def run_async(coro: Coroutine[Any, Any, T]) -> T:
    """Run async coroutine in sync context using modern asyncio best practices."""
    try:
        # Try to get the running loop
        loop = asyncio.get_running_loop()
    except RuntimeError:
        # No running loop, create a new one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()
    else:
        # There's already a running loop, use asyncio.run in a thread
        # This handles the case where Celery is running in an async context
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(asyncio.run, coro)
            return future.result()


@celery_app.task(bind=True, name="generate_image")
def generate_image_task(
    self,
    task_id: str,
    prompt: str,
    negative_prompt: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    style: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs,
):
    """Async task for image generation."""
    async def _generate():
        from app.core.ai_router import get_router
        from app.core.ai_router.base import TaskType

        router = await get_router()
        result, notification = await router.generate(
            TaskType.TEXT_TO_IMAGE,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            style=style,
            model=model,
            **kwargs,
        )

        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "provider": result.provider.value if result.provider else None,
            "model": result.model,
            "notification": notification,
        }

    # Update progress
    self.update_state(state="PROGRESS", meta={"progress": 10, "status": "initializing"})
    self.update_state(state="PROGRESS", meta={"progress": 30, "status": "generating"})

    result = run_async(_generate())

    self.update_state(state="PROGRESS", meta={"progress": 90, "status": "finalizing"})

    return result


@celery_app.task(bind=True, name="generate_video")
def generate_video_task(
    self,
    task_id: str,
    video_type: str,
    prompt: str,
    image: Optional[str] = None,
    video: Optional[str] = None,
    duration: int = 5,
    fps: int = 24,
    width: int = 1280,
    height: int = 720,
    style: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs,
):
    """Async task for video generation."""
    async def _generate():
        from app.core.ai_router import get_router
        from app.core.ai_router.base import TaskType

        router = await get_router()

        task_type = {
            "text_to_video": TaskType.TEXT_TO_VIDEO,
            "image_to_video": TaskType.IMAGE_TO_VIDEO,
            "video_to_video": TaskType.VIDEO_TO_VIDEO,
        }.get(video_type, TaskType.TEXT_TO_VIDEO)

        result, notification = await router.generate(
            task_type,
            prompt=prompt,
            image=image,
            video=video,
            duration=duration,
            fps=fps,
            width=width,
            height=height,
            style=style,
            model=model,
            **kwargs,
        )

        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "provider": result.provider.value if result.provider else None,
            "model": result.model,
            "notification": notification,
        }

    self.update_state(state="PROGRESS", meta={"progress": 5, "status": "queued"})
    self.update_state(state="PROGRESS", meta={"progress": 15, "status": "initializing"})

    result = run_async(_generate())

    return result


@celery_app.task(bind=True, name="generate_music")
def generate_music_task(
    self,
    task_id: str,
    prompt: str,
    style: Optional[str] = None,
    duration: Optional[int] = None,
    lyrics: Optional[str] = None,
    instrumental: bool = False,
    **kwargs,
):
    """Async task for music generation."""
    async def _generate():
        from app.core.ai_router import get_router
        from app.core.ai_router.base import TaskType

        router = await get_router()
        result, notification = await router.generate(
            TaskType.MUSIC_GENERATE,
            prompt=prompt,
            style=style,
            duration=duration,
            lyrics=lyrics,
            instrumental=instrumental,
            **kwargs,
        )

        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "provider": result.provider.value if result.provider else None,
            "model": result.model,
            "notification": notification,
        }

    self.update_state(state="PROGRESS", meta={"progress": 10, "status": "generating"})

    result = run_async(_generate())

    return result


@celery_app.task(bind=True, name="synthesize_voice")
def synthesize_voice_task(
    self,
    task_id: str,
    text: str,
    voice_id: Optional[str] = None,
    speed: float = 1.0,
    pitch: float = 1.0,
    emotion: Optional[str] = None,
    **kwargs,
):
    """Async task for voice synthesis."""
    async def _generate():
        from app.core.ai_router import get_router
        from app.core.ai_router.base import TaskType

        router = await get_router()
        result, notification = await router.generate(
            TaskType.VOICE_SYNTHESIZE,
            text=text,
            voice_id=voice_id,
            speed=speed,
            pitch=pitch,
            emotion=emotion,
            **kwargs,
        )

        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "provider": result.provider.value if result.provider else None,
            "model": result.model,
            "notification": notification,
        }

    self.update_state(state="PROGRESS", meta={"progress": 20, "status": "synthesizing"})

    result = run_async(_generate())

    return result


# Task status helper
def get_task_status(task_id: str) -> dict:
    """Get the status of a Celery task."""
    result = celery_app.AsyncResult(task_id)

    if result.ready():
        if result.successful():
            return {
                "status": "completed",
                "progress": 100,
                "result": result.result,
            }
        else:
            return {
                "status": "failed",
                "progress": 0,
                "error": str(result.result),
            }
    elif result.state == "PROGRESS":
        return {
            "status": "processing",
            "progress": result.info.get("progress", 50),
            "status_message": result.info.get("status"),
        }
    elif result.state == "PENDING":
        return {
            "status": "pending",
            "progress": 0,
        }
    else:
        return {
            "status": result.state.lower(),
            "progress": 0,
        }
