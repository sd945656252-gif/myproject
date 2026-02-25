from typing import Dict, Any, Optional, List
from app.integrations.base import BaseProvider, ProviderStatus
from app.core.exceptions import APILimitExceededException, ModelNotFoundException
from loguru import logger
import httpx


class HuggingFaceProvider(BaseProvider):
    """
    HuggingFace Inference API Provider
    Supports various open-source models via their API
    """

    def __init__(self, api_key: str, timeout: int = 60):
        super().__init__(api_key, timeout)
        self.base_url = "https://api-inference.huggingface.co/models"
        self.client = httpx.AsyncClient(timeout=timeout)

    @property
    def provider_name(self) -> str:
        return "huggingface"

    @property
    def supported_tasks(self) -> List[str]:
        return ["text_generation", "image_generation", "image_to_image"]

    async def health_check(self) -> bool:
        """Check HuggingFace API health"""
        try:
            response = await self.client.get(
                f"{self.base_url}/gpt2",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5
            )
            self._status = ProviderStatus.HEALTHY if response.status_code == 200 else ProviderStatus.UNHEALTHY
            return response.status_code == 200
        except Exception as e:
            logger.error(f"HuggingFace health check failed: {str(e)}")
            self._status = ProviderStatus.UNHEALTHY
            return False

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        model: str = "stabilityai/stable-diffusion-xl-base-1.0",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate image using Stable Diffusion XL
        """
        try:
            url = f"{self.base_url}/{model}"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "inputs": prompt,
                "parameters": {
                    "negative_prompt": negative_prompt,
                    "width": width,
                    "height": height,
                    "num_inference_steps": kwargs.get("steps", 30),
                    "guidance_scale": kwargs.get("cfg_scale", 7.5),
                }
            }

            response = await self.client.post(url, headers=headers, json=payload)
            response.raise_for_status()

            # HuggingFace returns raw bytes for images
            image_bytes = response.content

            # In production, upload to storage and return URL
            # For now, return base64
            import base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')

            return {
                "success": True,
                "images": [f"data:image/png;base64,{image_base64}"],
                "provider": self.provider_name,
                "model": model,
            }

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise APILimitExceededException(self.provider_name)
            logger.error(f"HuggingFace API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"HuggingFace image generation failed: {str(e)}")
            raise

    async def image_to_image(
        self,
        image_url: str,
        prompt: str,
        strength: float = 0.75,
        model: str = "timbrooks/instruct-pix2pix",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Image-to-image transformation
        """
        try:
            # Fetch source image
            image_response = await self.client.get(image_url)
            image_response.raise_for_status()
            image_bytes = image_response.content

            url = f"{self.base_url}/{model}"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
            }

            # Multipart form data
            files = {"inputs": image_bytes}
            data = {
                "prompt": prompt,
                "image_guidance_scale": 7.5,
                "guidance_scale": 7.5,
            }

            response = await self.client.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()

            result_bytes = response.content
            import base64
            result_base64 = base64.b64encode(result_bytes).decode('utf-8')

            return {
                "success": True,
                "images": [f"data:image/png;base64,{result_base64}"],
                "provider": self.provider_name,
                "model": model,
            }

        except Exception as e:
            logger.error(f"HuggingFace image-to-image failed: {str(e)}")
            raise

    async def generate_text(
        self,
        prompt: str,
        model: str = "gpt2",
        max_length: int = 500,
        **kwargs
    ) -> str:
        """
        Generate text completion
        """
        try:
            url = f"{self.base_url}/{model}"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": max_length,
                    "temperature": kwargs.get("temperature", 0.7),
                    "top_p": kwargs.get("top_p", 0.95),
                }
            }

            response = await self.client.post(url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            return result[0].get("generated_text", prompt)

        except Exception as e:
            logger.error(f"HuggingFace text generation failed: {str(e)}")
            raise

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
