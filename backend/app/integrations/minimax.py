from typing import Dict, Any, Optional, List
from app.integrations.base import BaseProvider, ProviderStatus
from app.core.exceptions import APILimitExceededException
from loguru import logger
import httpx
import asyncio


class MinimaxProvider(BaseProvider):
    """
    Minimax API Provider
    Specialized in TTS and voice cloning
    """

    def __init__(self, api_key: str, timeout: int = 120):
        super().__init__(api_key, timeout)
        # Note: Replace with actual Minimax API endpoint
        self.base_url = "https://api.minimax.chat/v1"  # Placeholder URL
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=timeout
        )

    @property
    def provider_name(self) -> str:
        return "minimax"

    @property
    def supported_tasks(self) -> List[str]:
        return ["tts", "voice_clone"]

    async def health_check(self) -> bool:
        """Check Minimax API health"""
        try:
            response = await self.client.get("/health", timeout=5)
            self._status = ProviderStatus.HEALTHY if response.status_code == 200 else ProviderStatus.UNHEALTHY
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Minimax health check failed: {str(e)}")
            self._status = ProviderStatus.UNHEALTHY
            return False

    async def text_to_speech(
        self,
        text: str,
        voice: str = "default",
        model: str = "speech-01",
        speed: float = 1.0,
        pitch: float = 1.0,
        output_format: str = "mp3",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Convert text to speech using Minimax TTS
        """
        try:
            payload = {
                "text": text,
                "voice": voice,
                "model": model,
                "speed": speed,
                "pitch": pitch,
                "output_format": output_format,
            }

            response = await self.client.post("/audio/speech", json=payload)
            response.raise_for_status()

            # Minimax returns audio bytes
            audio_bytes = response.content

            # In production, upload to storage
            import base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

            # Estimate duration (rough calculation: 150 words per minute)
            word_count = len(text.split())
            estimated_duration = (word_count / 150) * 60 / speed

            return {
                "success": True,
                "audio_url": f"data:audio/{output_format};base64,{audio_base64}",
                "provider": self.provider_name,
                "model": model,
                "voice": voice,
                "duration": estimated_duration,
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise APILimitExceededException(self.provider_name)
            logger.error(f"Minimax API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Minimax TTS failed: {str(e)}")
            raise

    async def voice_clone(
        self,
        reference_audio_url: str,
        text: str,
        model: str = "speech-01",
        speed: float = 1.0,
        output_format: str = "mp3",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Clone voice from reference audio and generate new speech
        """
        try:
            payload = {
                "reference_audio": reference_audio_url,
                "text": text,
                "model": model,
                "speed": speed,
                "output_format": output_format,
            }

            response = await self.client.post("/audio/clone", json=payload)
            response.raise_for_status()

            audio_bytes = response.content

            import base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

            word_count = len(text.split())
            estimated_duration = (word_count / 150) * 60 / speed

            return {
                "success": True,
                "audio_url": f"data:audio/{output_format};base64,{audio_base64}",
                "provider": self.provider_name,
                "model": model,
                "duration": estimated_duration,
            }

        except Exception as e:
            logger.error(f"Minimax voice cloning failed: {str(e)}")
            raise

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
