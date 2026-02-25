from typing import Dict, Any, Optional, List
from app.integrations.base import BaseProvider, ProviderStatus
from app.core.exceptions import APILimitExceededException
from loguru import logger
import httpx
import time


class JimengProvider(BaseProvider):
    """
    Jimeng API Provider (ByteDance)
    Supports image generation and video generation (Seedance)
    """

    def __init__(self, api_key: str, timeout: int = 180):
        super().__init__(api_key, timeout)
        # Note: Replace with actual Jimeng API endpoint
        self.base_url = "https://api.jimeng.com/v1"  # Placeholder URL
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=timeout
        )

    @property
    def provider_name(self) -> str:
        return "jimeng"

    @property
    def supported_tasks(self) -> List[str]:
        return [
            "image_generation",
            "image_to_image",
            "video_generation",
            "image_to_video",
        ]

    async def health_check(self) -> bool:
        """Check Jimeng API health"""
        try:
            # Replace with actual health check endpoint
            response = await self.client.get("/health", timeout=5)
            self._status = ProviderStatus.HEALTHY if response.status_code == 200 else ProviderStatus.UNHEALTHY
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Jimeng health check failed: {str(e)}")
            self._status = ProviderStatus.UNHEALTHY
            return False

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        model: str = "jimeng-v1",
        steps: int = 30,
        cfg_scale: float = 7.5,
        seed: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate image using Jimeng API
        """
        try:
            payload = {
                "prompt": prompt,
                "negative_prompt": negative_prompt or "",
                "width": width,
                "height": height,
                "model": model,
                "steps": steps,
                "cfg_scale": cfg_scale,
            }

            if seed is not None:
                payload["seed"] = seed

            # Submit task
            response = await self.client.post("/image/generate", json=payload)
            response.raise_for_status()

            task_data = response.json()
            task_id = task_data.get("task_id")

            if not task_id:
                raise ValueError("No task_id returned from Jimeng API")

            # Poll for result
            result = await self._poll_image_task(task_id)

            return {
                "success": True,
                "images": result.get("images", []),
                "provider": self.provider_name,
                "model": model,
                "task_id": task_id,
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise APILimitExceededException(self.provider_name)
            logger.error(f"Jimeng API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Jimeng image generation failed: {str(e)}")
            raise

    async def image_to_image(
        self,
        image_url: str,
        prompt: str,
        strength: float = 0.75,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Image-to-image transformation
        """
        try:
            payload = {
                "source_image": image_url,
                "prompt": prompt,
                "strength": strength,
                "steps": kwargs.get("steps", 30),
                "cfg_scale": kwargs.get("cfg_scale", 7.5),
            }

            response = await self.client.post("/image/img2img", json=payload)
            response.raise_for_status()

            task_data = response.json()
            task_id = task_data.get("task_id")

            result = await self._poll_image_task(task_id)

            return {
                "success": True,
                "images": result.get("images", []),
                "provider": self.provider_name,
                "task_id": task_id,
            }

        except Exception as e:
            logger.error(f"Jimeng image-to-image failed: {str(e)}")
            raise

    async def generate_video(
        self,
        prompt: str,
        model: str = "seedance2.0",
        duration: float = 5.0,
        fps: int = 24,
        width: int = 1280,
        height: int = 720,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate video using Seedance model
        """
        try:
            payload = {
                "prompt": prompt,
                "model": model,
                "duration": duration,
                "fps": fps,
                "width": width,
                "height": height,
            }

            response = await self.client.post("/video/generate", json=payload)
            response.raise_for_status()

            task_data = response.json()
            task_id = task_data.get("task_id")

            # Poll for video result
            result = await self._poll_video_task(task_id)

            return {
                "success": True,
                "video_url": result.get("video_url"),
                "thumbnail_url": result.get("thumbnail_url"),
                "provider": self.provider_name,
                "model": model,
                "task_id": task_id,
            }

        except Exception as e:
            logger.error(f"Jimeng video generation failed: {str(e)}")
            raise

    async def _poll_image_task(self, task_id: str, max_wait: int = 300) -> Dict[str, Any]:
        """Poll image generation task until complete"""
        start_time = time.time()

        while time.time() - start_time < max_wait:
            try:
                response = await self.client.get(f"/image/task/{task_id}")
                response.raise_for_status()

                data = response.json()
                status = data.get("status")

                if status == "completed":
                    return data
                elif status == "failed":
                    raise ValueError(f"Image generation failed: {data.get('error')}")

                await asyncio.sleep(2)  # Wait 2 seconds before polling again

            except httpx.HTTPStatusError as e:
                logger.error(f"Polling task {task_id} failed: {e.response.status_code}")
                raise

        raise TimeoutError(f"Image generation timed out after {max_wait} seconds")

    async def _poll_video_task(self, task_id: str, max_wait: int = 600) -> Dict[str, Any]:
        """Poll video generation task until complete"""
        start_time = time.time()

        while time.time() - start_time < max_wait:
            try:
                response = await self.client.get(f"/video/task/{task_id}")
                response.raise_for_status()

                data = response.json()
                status = data.get("status")

                if status == "completed":
                    return data
                elif status == "failed":
                    raise ValueError(f"Video generation failed: {data.get('error')}")

                await asyncio.sleep(5)  # Videos take longer, poll every 5 seconds

            except httpx.HTTPStatusError as e:
                logger.error(f"Polling video task {task_id} failed: {e.response.status_code}")
                raise

        raise TimeoutError(f"Video generation timed out after {max_wait} seconds")

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
