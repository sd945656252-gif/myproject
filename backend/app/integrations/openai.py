from typing import Dict, Any, Optional, List
from app.integrations.base import BaseProvider, ProviderStatus
from app.core.exceptions import APILimitExceededException
from loguru import logger
import httpx


class OpenAIProvider(BaseProvider):
    """
    OpenAI API Provider
    Supports GPT-4, DALL-E 3, TTS, etc.
    """

    def __init__(self, api_key: str, timeout: int = 120):
        super().__init__(api_key, timeout)
        self.base_url = "https://api.openai.com/v1"
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=timeout
        )

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def supported_tasks(self) -> List[str]:
        return [
            "text_generation",
            "image_generation",
            "tts",
            "image_to_image",  # Via DALL-E 3
        ]

    async def health_check(self) -> bool:
        """Check OpenAI API health"""
        try:
            response = await self.client.get("/models", timeout=5)
            self._status = ProviderStatus.HEALTHY if response.status_code == 200 else ProviderStatus.UNHEALTHY
            return response.status_code == 200
        except Exception as e:
            logger.error(f"OpenAI health check failed: {str(e)}")
            self._status = ProviderStatus.UNHEALTHY
            return False

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        model: str = "dall-e-3",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate image using DALL-E 3
        Note: DALL-E 3 ignores negative_prompt and has fixed sizes
        """
        try:
            # DALL-E 3 only supports 1024x1024, but we can resize
            payload = {
                "model": model,
                "prompt": prompt,
                "n": kwargs.get("num_images", 1),
                "size": "1024x1024",  # DALL-E 3 fixed size
                "quality": kwargs.get("quality", "standard"),
                "response_format": "url",
            }

            response = await self.client.post("/images/generations", json=payload)
            response.raise_for_status()

            data = response.json()

            images = []
            for item in data.get("data", []):
                image_url = item.get("url")
                images.append(image_url)

            return {
                "success": True,
                "images": images,
                "provider": self.provider_name,
                "model": model,
                "revised_prompt": data.get("data", [{}])[0].get("revised_prompt"),
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise APILimitExceededException(self.provider_name)
            logger.error(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"OpenAI image generation failed: {str(e)}")
            raise

    async def generate_text(
        self,
        prompt: str,
        model: str = "gpt-4",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> str:
        """
        Generate text completion using GPT-4
        """
        try:
            payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            response = await self.client.post("/chat/completions", json=payload)
            response.raise_for_status()

            data = response.json()
            return data["choices"][0]["message"]["content"]

        except Exception as e:
            logger.error(f"OpenAI text generation failed: {str(e)}")
            raise

    async def text_to_speech(
        self,
        text: str,
        voice: str = "alloy",
        model: str = "tts-1",
        output_format: str = "mp3",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Convert text to speech using OpenAI TTS
        """
        try:
            payload = {
                "model": model,
                "input": text,
                "voice": voice,
                "response_format": output_format,
            }

            response = await self.client.post("/audio/speech", json=payload)
            response.raise_for_status()

            audio_bytes = response.content

            # In production, upload to storage
            import base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

            return {
                "success": True,
                "audio_url": f"data:audio/{output_format};base64,{audio_base64}",
                "provider": self.provider_name,
                "model": model,
            }

        except Exception as e:
            logger.error(f"OpenAI TTS failed: {str(e)}")
            raise

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
