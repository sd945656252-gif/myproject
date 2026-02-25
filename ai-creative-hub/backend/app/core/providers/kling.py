"""
AI Provider - Kling (快手可灵) provider implementation.
"""
import asyncio
import uuid
from typing import Optional

import httpx
from loguru import logger

from app.core.ai_router.base import (
    BaseProvider,
    GenerationResult,
    ProviderType,
    TaskType,
)
from app.core.ai_router.config import ProviderConfig


class KlingProvider(BaseProvider):
    """Kling (快手可灵) API provider for video generation."""

    SUPPORTED_TASKS = {
        TaskType.TEXT_TO_VIDEO,
        TaskType.IMAGE_TO_VIDEO,
        TaskType.VIDEO_TO_VIDEO,
    }

    # API endpoints
    ENDPOINTS = {
        TaskType.TEXT_TO_VIDEO: "/v1/videos/text2video",
        TaskType.IMAGE_TO_VIDEO: "/v1/videos/image2video",
        TaskType.VIDEO_TO_VIDEO: "/v1/videos/video2video",
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.api_url = config.api_url or "https://api.klingai.com"

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using Kling API."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by Kling",
            )

        try:
            # Submit task
            task_result = await self._submit_task(task_type, **kwargs)

            if not task_result.get("success"):
                return task_result

            task_id = task_result["task_id"]

            # Poll for result
            result = await self._poll_result(task_id)

            return result

        except Exception as e:
            logger.error(f"Kling API error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.KLING,
            )

    async def _submit_task(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> dict:
        """Submit a task to Kling API."""
        endpoint = self.ENDPOINTS.get(task_type)
        if not endpoint:
            return {
                "success": False,
                "error": f"No endpoint for task type: {task_type}",
            }

        url = f"{self.api_url}{endpoint}"

        # Build request payload based on task type
        if task_type == TaskType.TEXT_TO_VIDEO:
            payload = self._build_text_to_video_payload(**kwargs)
        elif task_type == TaskType.IMAGE_TO_VIDEO:
            payload = self._build_image_to_video_payload(**kwargs)
        else:
            payload = self._build_video_to_video_payload(**kwargs)

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=60,
            )

        if response.status_code != 200:
            return {
                "success": False,
                "error": f"API error: {response.status_code} - {response.text}",
            }

        data = response.json()
        return {
            "success": True,
            "task_id": data.get("data", {}).get("task_id"),
        }

    def _build_text_to_video_payload(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1280,
        height: int = 720,
        duration: int = 5,
        fps: int = 24,
        style: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs,
    ) -> dict:
        """Build payload for text-to-video."""
        return {
            "model": model or "kling-v1",
            "prompt": prompt,
            "negative_prompt": negative_prompt or "",
            "cfg_scale": 0.5,
            "mode": "std" if duration <= 5 else "pro",
            "aspect_ratio": f"{width}:{height}",
            "duration": str(duration),
            "external_task_id": str(uuid.uuid4()),
        }

    def _build_image_to_video_payload(
        self,
        prompt: str,
        image: str,
        duration: int = 5,
        **kwargs,
    ) -> dict:
        """Build payload for image-to-video."""
        return {
            "model": "kling-v1",
            "prompt": prompt,
            "image": image,
            "duration": str(duration),
            "external_task_id": str(uuid.uuid4()),
        }

    def _build_video_to_video_payload(
        self,
        prompt: str,
        video: str,
        **kwargs,
    ) -> dict:
        """Build payload for video-to-video."""
        return {
            "model": "kling-v1",
            "prompt": prompt,
            "video": video,
            "external_task_id": str(uuid.uuid4()),
        }

    async def _poll_result(
        self,
        task_id: str,
        timeout: int = 600,
        interval: int = 5,
    ) -> GenerationResult:
        """Poll for task result."""
        url = f"{self.api_url}/v1/videos/query/{task_id}"
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
        }

        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                return GenerationResult(
                    success=False,
                    error="Video generation timed out",
                    provider=ProviderType.KLING,
                )

            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=30)

            if response.status_code != 200:
                return GenerationResult(
                    success=False,
                    error=f"Query error: {response.status_code}",
                    provider=ProviderType.KLING,
                )

            data = response.json()
            status = data.get("data", {}).get("task_status")

            if status == "succeed":
                video_url = data.get("data", {}).get("task_result", {}).get("videos", [{}])[0].get("url")
                return GenerationResult(
                    success=True,
                    data={
                        "video_url": video_url,
                        "task_id": task_id,
                        "duration": data.get("data", {}).get("task_result", {}).get("videos", [{}])[0].get("duration", 0),
                    },
                    provider=ProviderType.KLING,
                    model="kling-v1",
                )

            elif status == "failed":
                error_msg = data.get("data", {}).get("task_status_msg", "Unknown error")
                return GenerationResult(
                    success=False,
                    error=error_msg,
                    provider=ProviderType.KLING,
                )

            # Still processing, wait and retry
            await asyncio.sleep(interval)

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for Kling."""
        from app.core.ai_router.validator import ParameterValidator

        is_valid, error = ParameterValidator.validate(task_type, **kwargs)

        if is_valid:
            # Additional Kling-specific validation
            duration = kwargs.get("duration", 5)
            if duration > 60:
                return False, "Kling maximum duration is 60 seconds"

        return is_valid, error

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS
