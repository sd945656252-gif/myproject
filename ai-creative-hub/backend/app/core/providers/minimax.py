"""
AI Provider - Minimax provider implementation for TTS and voice cloning.
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


class MinimaxProvider(BaseProvider):
    """Minimax API provider for TTS and voice cloning."""

    SUPPORTED_TASKS = {
        TaskType.VOICE_SYNTHESIZE,
        TaskType.VOICE_CLONE,
    }

    # Voice IDs
    DEFAULT_VOICES = {
        "male": "male-qn-qingse",
        "female": "female-shaonv",
        "narrator": "presenter_male",
        "young_male": "male-qn-jingying",
        "young_female": "female-yujie",
    }

    def __init__(self, config: ProviderConfig):
        super().__init__(config)
        self.api_url = config.api_url or "https://api.minimax.chat"
        self.group_id = config.api_key  # group_id stored in api_key for simplicity

    async def generate(
        self,
        task_type: TaskType,
        **kwargs,
    ) -> GenerationResult:
        """Generate content using Minimax API."""
        if not self.supports_task(task_type):
            return GenerationResult(
                success=False,
                error=f"Task type {task_type} not supported by Minimax",
            )

        try:
            if task_type == TaskType.VOICE_SYNTHESIZE:
                return await self._synthesize_voice(**kwargs)
            elif task_type == TaskType.VOICE_CLONE:
                return await self._clone_voice(**kwargs)
            else:
                return GenerationResult(
                    success=False,
                    error=f"Task {task_type} not implemented",
                )

        except Exception as e:
            logger.error(f"Minimax API error: {e}")
            return GenerationResult(
                success=False,
                error=str(e),
                provider=ProviderType.MINIMAX,
            )

    async def _synthesize_voice(
        self,
        text: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0,
        pitch: float = 1.0,
        emotion: Optional[str] = None,
        **kwargs,
    ) -> GenerationResult:
        """Synthesize voice using Minimax TTS."""
        url = f"{self.api_url}/v1/text_to_speech"

        # Map voice_id to Minimax voice
        voice = voice_id or self.DEFAULT_VOICES["female"]
        if voice in self.DEFAULT_VOICES:
            voice = self.DEFAULT_VOICES[voice]

        payload = {
            "text": text,
            "voice_id": voice,
            "model": "speech-01",
            "speed": speed,
            "pitch": pitch,
            "audio_sample_rate": 32000,
            "audio_encoding": "mp3",
        }

        if emotion:
            payload["emotion"] = emotion

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=120,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code} - {response.text}",
                provider=ProviderType.MINIMAX,
            )

        # Response is audio data
        audio_data = response.content
        import base64
        audio_base64 = base64.b64encode(audio_data).decode()
        audio_url = f"data:audio/mp3;base64,{audio_base64}"

        # Estimate duration
        duration = len(text) / (5 * speed)  # Rough estimate: 5 chars per second

        return GenerationResult(
            success=True,
            data={
                "audio_url": audio_url,
                "duration": duration,
                "task_id": str(uuid.uuid4()),
            },
            provider=ProviderType.MINIMAX,
            model="speech-01",
        )

    async def _clone_voice(
        self,
        text: str,
        reference_audio: str,
        name: Optional[str] = None,
        **kwargs,
    ) -> GenerationResult:
        """Clone voice from reference audio."""
        url = f"{self.api_url}/v1/voice_clone"

        payload = {
            "text": text,
            "reference_audio": reference_audio,
            "name": name or f"voice_{uuid.uuid4().hex[:8]}",
        }

        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
                timeout=120,
            )

        if response.status_code != 200:
            return GenerationResult(
                success=False,
                error=f"API error: {response.status_code} - {response.text}",
                provider=ProviderType.MINIMAX,
            )

        data = response.json()
        return GenerationResult(
            success=True,
            data={
                "voice_id": data.get("voice_id"),
                "audio_url": data.get("audio_url"),
                "task_id": str(uuid.uuid4()),
            },
            provider=ProviderType.MINIMAX,
            model="voice-clone",
        )

    async def get_voices(self) -> list[dict]:
        """Get available voices."""
        return [
            {"id": "male-qn-qingse", "name": "青涩青年音", "gender": "male"},
            {"id": "male-qn-jingying", "name": "精英青年音", "gender": "male"},
            {"id": "male-qn-badao", "name": "霸道青年音", "gender": "male"},
            {"id": "male-qn-daxuesheng", "name": "大学生青年音", "gender": "male"},
            {"id": "female-shaonv", "name": "少女音", "gender": "female"},
            {"id": "female-yujie", "name": "御姐音", "gender": "female"},
            {"id": "female-chengshu", "name": "成熟女性音", "gender": "female"},
            {"id": "presenter_male", "name": "男解说音", "gender": "male"},
            {"id": "presenter_female", "name": "女解说音", "gender": "female"},
        ]

    async def validate_params(
        self, task_type: TaskType, **kwargs
    ) -> tuple[bool, Optional[str]]:
        """Validate parameters for Minimax."""
        from app.core.ai_router.validator import ParameterValidator

        is_valid, error = ParameterValidator.validate(task_type, **kwargs)

        if is_valid:
            text = kwargs.get("text", "")
            if len(text) > 5000:
                return False, "Text exceeds maximum length of 5000 characters"

        return is_valid, error

    def supports_task(self, task_type: TaskType) -> bool:
        """Check if task is supported."""
        return task_type in self.SUPPORTED_TASKS
