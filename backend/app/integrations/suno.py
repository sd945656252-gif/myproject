from typing import Dict, Any, Optional, List
from app.integrations.base import BaseProvider, ProviderStatus
from app.core.exceptions import APILimitExceededException
from loguru import logger
import httpx
import time


class SunoProvider(BaseProvider):
    """
    Suno API Provider
    Specialized in music generation
    """

    def __init__(self, api_key: str, timeout: int = 300):
        super().__init__(api_key, timeout)
        # Note: Replace with actual Suno API endpoint
        self.base_url = "https://api.suno.com/v1"  # Placeholder URL
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=timeout
        )

    @property
    def provider_name(self) -> str:
        return "suno"

    @property
    def supported_tasks(self) -> List[str]:
        return ["music_generation"]

    async def health_check(self) -> bool:
        """Check Suno API health"""
        try:
            response = await self.client.get("/health", timeout=5)
            self._status = ProviderStatus.HEALTHY if response.status_code == 200 else ProviderStatus.UNHEALTHY
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Suno health check failed: {str(e)}")
            self._status = ProviderStatus.UNHEALTHY
            return False

    async def generate_music(
        self,
        prompt: Optional[str] = None,
        style: str = "cinematic",
        mood: str = "epic",
        duration: float = 30.0,
        lyrics: Optional[str] = None,
        instrumental: bool = False,
        model: str = "suno-v3",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate music using Suno API
        """
        try:
            # Build prompt from parameters
            full_prompt = f"{style} style, {mood} mood"
            if prompt:
                full_prompt = f"{full_prompt}, {prompt}"

            payload = {
                "prompt": full_prompt,
                "model": model,
                "duration": duration,
                "instrumental": instrumental,
            }

            if lyrics:
                payload["lyrics"] = lyrics

            # Submit music generation task
            response = await self.client.post("/music/generate", json=payload)
            response.raise_for_status()

            task_data = response.json()
            task_id = task_data.get("task_id")

            if not task_id:
                raise ValueError("No task_id returned from Suno API")

            # Poll for result
            result = await self._poll_music_task(task_id)

            return {
                "success": True,
                "audio_url": result.get("audio_url"),
                "cover_image_url": result.get("cover_image_url"),
                "provider": self.provider_name,
                "model": model,
                "task_id": task_id,
                "duration": duration,
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise APILimitExceededException(self.provider_name)
            logger.error(f"Suno API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Suno music generation failed: {str(e)}")
            raise

    async def _poll_music_task(self, task_id: str, max_wait: int = 300) -> Dict[str, Any]:
        """
        Poll music generation task until complete
        """
        start_time = time.time()

        while time.time() - start_time < max_wait:
            try:
                response = await self.client.get(f"/music/task/{task_id}")
                response.raise_for_status()

                data = response.json()
                status = data.get("status")

                if status == "completed":
                    return data
                elif status == "failed":
                    raise ValueError(f"Music generation failed: {data.get('error')}")
                elif status == "processing":
                    progress = data.get("progress", 0)
                    logger.info(f"Suno music task {task_id} progress: {progress}%")

                await asyncio.sleep(5)  # Poll every 5 seconds

            except httpx.HTTPStatusError as e:
                logger.error(f"Polling music task {task_id} failed: {e.response.status_code}")
                raise

        raise TimeoutError(f"Music generation timed out after {max_wait} seconds")

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
