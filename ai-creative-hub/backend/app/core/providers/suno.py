"""
AI Provider - Suno provider implementation for music generation.
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


class SunoProvider(BaseProvider):
    """Suno API provider for AI music generation."""

    SUPPORTED_TASKS = {
        TaskType.MUSIC_GENERATE,
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.api_url = config.api_url or "https://api.suno.ai"

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using Suno API."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by Suno",
            )

        try:
            return await self._generate_music(**kwargs)

        except Exception as e:
            logger.error(f"Suno API error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.SUNO,
            )

    async def _generate_music(
        self,
        prompt: str,
        style: Optional[str] = None,
        duration: Optional[int] = None,
        lyrics: Optional[str] = None,
        instrumental: bool = False,
        **kwargs,
    ) -> GenerationResult:
        """Generate music using Suno."""
        url = f"{self.api_url}/v1/generate"

        payload = {
            "prompt": prompt,
            "make_instrumental": instrumental,
            "mv": "chirp-v3-5",  # Latest model
        }

        if style:
            payload["tags"] = style

        if lyrics and not instrumental:
            payload["lyrics"] = lyrics

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            # Submit generation request
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=60,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code} - {response.text}",
                provider=ProviderType.SUNO,
            )

        data = response.json()
        clips = data.get("clips", [])

        if not clips:
            return GenerationResult(
                success=False,
                error="No clips generated",
                provider=ProviderType.SUNO,
            )

        # Get the first clip
        clip = clips[0]
        clip_id = clip.get("id")

        # Poll for completion
        result = await self._poll_clip_status(clip_id)

        return result

    async def _poll_clip_status(
        self,
        clip_id: str,
        timeout: int = 300,
        interval: int = 5,
    ) -> GenerationResult:
        """Poll for clip generation status."""
        url = f"{self.api_url}/v1/generate/{clip_id}"
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
        }

        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout:
                return GenerationResult(
                    success=False,
                    error="Music generation timed out",
                    provider=ProviderType.SUNO,
                )

            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=30)

            if response.status_code != 200:
                return GenerationResult(
                    success=False,
                    error=f"Query error: {response.status_code}",
                    provider=ProviderType.SUNO,
                )

            data = response.json()
            status = data.get("status")

            if status == "complete":
                return GenerationResult(
                    success=True,
                    data={
                        "audio_url": data.get("audio_url"),
                        "video_url": data.get("video_url"),
                        "duration": data.get("duration", 0),
                        "title": data.get("title"),
                        "task_id": clip_id,
                    },
                    provider=ProviderType.SUNO,
                    model="suno-v3.5",
                )

            elif status == "error":
                return GenerationResult(
                    success=False,
                    error=data.get("error_message", "Generation failed"),
                    provider=ProviderType.SUNO,
                )

            await asyncio.sleep(interval)

    async def get_styles(self) -> list[str]:
        """Get available music styles."""
        return [
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
            "r&b",
            "country",
            "metal",
            "blues",
            "reggae",
        ]

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for Suno."""
        from app.core.ai_router.validator import ParameterValidator

        is_valid, error = ParameterValidator.validate(task_type, **kwargs)

        if is_valid:
            prompt = kwargs.get("prompt", "")
            if len(prompt) > 500:
                return False, "Prompt exceeds maximum length of 500 characters"

        return is_valid, error

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS
