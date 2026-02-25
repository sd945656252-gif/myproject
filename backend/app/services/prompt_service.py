from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.prompt import (
    ImageToPromptRequest,
    TextOptimizationRequest,
    PromptResponse,
)
from app.core.ai_router import AIRouter, TaskType as RouterTaskType
from loguru import logger
import base64
import re


class PromptService:
    def __init__(self, db: AsyncSession, router: AIRouter = None):
        self.db = db
        self.router = router

    async def _get_router(self) -> AIRouter:
        """Get or create router instance"""
        if self.router is None:
            from app.core.ai_router import get_router
            self.router = await get_router()
        return self.router

    async def image_to_prompt(self, request: ImageToPromptRequest) -> PromptResponse:
        """
        Reverse engineer prompt from image using vision models
        Uses OpenAI GPT-4 Vision or HuggingFace BLIP
        """
        try:
            router = await self._get_router()

            # Use OpenAI GPT-4 Vision for image analysis
            if "openai" in router.providers:
                provider = router.providers["openai"]
                try:
                    result = await self._analyze_with_openai(provider, request)
                    return PromptResponse(
                        success=True,
                        original_text=None,
                        optimized_text=result["prompt"],
                        tags=result["tags"],
                        meta={"provider": "openai", "language": request.language}
                    )
                except Exception as e:
                    logger.warning(f"OpenAI analysis failed: {e}")

            # Fallback to HuggingFace BLIP
            if "huggingface" in router.providers:
                provider = router.providers["huggingface"]
                try:
                    result = await self._analyze_with_huggingface(provider, request)
                    return PromptResponse(
                        success=True,
                        original_text=None,
                        optimized_text=result["prompt"],
                        tags=result["tags"],
                        meta={"provider": "huggingface", "language": request.language}
                    )
                except Exception as e:
                    logger.warning(f"HuggingFace analysis failed: {e}")

            # Final fallback - simulate analysis
            return self._simulate_analysis(request)

        except Exception as e:
            logger.error(f"Image-to-prompt failed: {str(e)}")
            raise

    async def optimize_prompt(self, request: TextOptimizationRequest) -> PromptResponse:
        """
        Optimize prompt for specific AI models
        Uses GPT-4 for intelligent enhancement
        """
        try:
            router = await self._get_router()

            # Use OpenAI GPT-4 for optimization
            if "openai" in router.providers:
                provider = router.providers["openai"]
                try:
                    result = await self._optimize_with_openai(provider, request)
                    return PromptResponse(
                        success=True,
                        original_text=request.prompt,
                        optimized_text=result["prompt"],
                        tags=result["tags"],
                        meta={
                            "provider": "openai",
                            "target_style": request.target_style.value
                        }
                    )
                except Exception as e:
                    logger.warning(f"OpenAI optimization failed: {e}")

            # Fallback - rule-based optimization
            return self._rule_based_optimization(request)

        except Exception as e:
            logger.error(f"Prompt optimization failed: {str(e)}")
            raise

    async def _analyze_with_openai(self, provider, request: ImageToPromptRequest) -> dict:
        """Use OpenAI GPT-4 Vision to analyze image"""
        # Build system prompt based on language
        if request.language == "zh":
            system_prompt = """你是一个专业的图像分析师。请详细描述图片内容，包括：
1. 主要主题和物体
2. 场景和背景
3. 光影和色彩
4. 构图和视角
5. 氛围和情感
6. 艺术风格

请用中文回答，输出格式为：
主体：[描述]
场景：[描述]
光影：[描述]
风格：[描述]
完整提示词：[综合描述]"""
        else:
            system_prompt = """You are a professional image analyst. Describe the image in detail, including:
1. Main subject and objects
2. Scene and background
3. Lighting and color
4. Composition and perspective
5. Mood and emotion
6. Artistic style

Output format:
Subject: [description]
Scene: [description]
Lighting: [description]
Style: [description]
Full prompt: [comprehensive description]"""

        # Prepare message with image
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this image:"},
                    {
                        "type": "image_url",
                        "image_url": {"url": str(request.image_url)}
                    }
                ]
            }
        ]

        # Call GPT-4 Vision API
        response = await provider.client.post(
            "/chat/completions",
            json={
                "model": "gpt-4-vision-preview",
                "messages": messages,
                "max_tokens": 1000,
            },
            timeout=60
        )

        data = response.json()
        content = data["choices"][0]["message"]["content"]

        # Parse the response
        prompt, tags = self._parse_vision_response(content, request.language)

        return {
            "prompt": prompt,
            "tags": tags
        }

    async def _analyze_with_huggingface(self, provider, request: ImageToPromptRequest) -> dict:
        """Use HuggingFace BLIP model for image captioning"""
        # Fetch image
        import httpx
        async with httpx.AsyncClient() as http_client:
            image_response = await http_client.get(str(request.image_url))
            image_bytes = image_response.content

        # Call BLIP model
        url = f"{provider.base_url}/Salesforce/blip-image-captioning-large"
        response = await provider.client.post(
            url,
            headers={"Authorization": f"Bearer {provider.api_key}"},
            files={"inputs": image_bytes},
            timeout=60
        )

        result = response.json()
        caption = result[0].get("generated_text", "")

        # Enhance caption based on detail level
        if request.detail_level == "detailed":
            caption = f"Detailed scene: {caption}. High quality, professional lighting, cinematic composition."
        elif request.detail_level == "full":
            caption = f"Masterpiece, ultra detailed: {caption}. 8K resolution, professional photography, studio lighting, perfect composition, award-winning style."

        return {
            "prompt": caption,
            "tags": ["blip", "image-captioning"]
        }

    async def _optimize_with_openai(self, provider, request: TextOptimizationRequest) -> dict:
        """Use GPT-4 to optimize prompt"""
        # Build optimization instructions based on target style
        style_instructions = {
            "midjourney": "Optimize for Midjourney: use specific aspect ratios, version parameters (--v 6), artistic keywords, composition terms, and lighting descriptions.",
            "stable_diffusion": "Optimize for Stable Diffusion: use technical parameters, weighting syntax, negative prompts, and model-specific tokens.",
            "dall_e": "Optimize for DALL-E 3: use descriptive, narrative language, focus on details and context.",
            "sora": "Optimize for Sora (video): include motion, camera movement, temporal descriptions, and scene transitions.",
        }

        system_prompt = f"""You are an expert AI art prompt engineer. Your task is to optimize user prompts for {request.target_style.value}.

{style_instructions.get(request.target_style.value, '')}

Enhancement levels:
- minimal: Add essential technical terms only
- moderate: Add artistic and technical enhancements
- maximum: Add comprehensive artistic, technical, and stylistic details

Output ONLY the optimized prompt, nothing else."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Optimize this prompt: {request.prompt}"}
        ]

        response = await provider.client.post(
            "/chat/completions",
            json={
                "model": "gpt-4",
                "messages": messages,
                "max_tokens": 500,
            },
            timeout=30
        )

        data = response.json()
        optimized_prompt = data["choices"][0]["message"]["content"].strip()

        # Extract tags
        tags = self._extract_tags(optimized_prompt, request.target_style.value)

        return {
            "prompt": optimized_prompt,
            "tags": tags
        }

    def _parse_vision_response(self, content: str, language: str) -> tuple[str, list]:
        """Parse vision analysis response"""
        # Extract the full prompt from the response
        if language == "zh":
            match = re.search(r"完整提示词[：:]\s*(.+)", content, re.IGNORECASE)
        else:
            match = re.search(r"Full prompt[::]\s*(.+)", content, re.IGNORECASE)

        if match:
            prompt = match.group(1).strip()
        else:
            # Fallback: use the entire response
            prompt = content

        # Extract keywords as tags
        tags = re.findall(r"\b[A-Z][a-z]+\b", prompt)[:10]

        return prompt, tags

    def _extract_tags(self, prompt: str, style: str) -> list:
        """Extract relevant tags from prompt"""
        # Common keywords by style
        style_tags = {
            "midjourney": ["--v", "--ar", "--style", "--chaos"],
            "stable_diffusion": ["(masterpiece)", "(best quality)", "detailed", "8k"],
            "dall_e": ["detailed", "vibrant", "professional"],
            "sora": ["4k", "cinematic", "motion", "pan", "zoom"],
        }

        tags = []

        # Add style-specific tags found in prompt
        for tag in style_tags.get(style, []):
            if tag.lower() in prompt.lower():
                tags.append(tag)

        # Extract key adjectives
        adjectives = re.findall(r"\b(detailed|cinematic|epic|dramatic|beautiful|stunning)\b", prompt, re.IGNORECASE)
        tags.extend(adjectives)

        return list(set(tags))

    def _simulate_analysis(self, request: ImageToPromptRequest) -> PromptResponse:
        """Simulate image analysis for demo purposes"""
        if request.language == "zh":
            prompt = "美丽的风景照片，山峦起伏，阳光明媚，天空湛蓝，自然风光，高清摄影，专业构图， cinematic lighting"
            tags = ["风景", "山峦", "阳光", "自然"]
        else:
            prompt = "Beautiful landscape photo with rolling mountains, bright sunshine, blue sky, natural scenery, high definition photography, professional composition, cinematic lighting"
            tags = ["landscape", "mountains", "sunshine", "nature"]

        return PromptResponse(
            success=True,
            original_text=None,
            optimized_text=prompt,
            tags=tags,
            meta={"provider": "simulation", "language": request.language}
        )

    def _rule_based_optimization(self, request: TextOptimizationRequest) -> PromptResponse:
        """Rule-based prompt optimization"""
        optimized = request.prompt

        # Add style-specific enhancements
        if request.target_style.value == "midjourney":
            optimized += " --v 6 --style raw --ar 16:9"
        elif request.target_style.value == "stable_diffusion":
            optimized = f"(masterpiece, best quality, detailed:1.2), {optimized}"
        elif request.target_style.value == "dall_e":
            optimized = f"Detailed, professional, {optimized}"
        elif request.target_style.value == "sora":
            optimized = f"Cinematic, 4K, {optimized}, smooth camera movement"

        # Add enhancement keywords
        if request.enhancement_level == "moderate":
            optimized = f"High quality, {optimized}"
        elif request.enhancement_level == "maximum":
            optimized = f"Masterpiece, ultra detailed, professional, 8K, {optimized}, award-winning"

        tags = [request.target_style.value, "optimized", request.enhancement_level]

        return PromptResponse(
            success=True,
            original_text=request.prompt,
            optimized_text=optimized,
            tags=tags,
            meta={"provider": "rules", "target_style": request.target_style.value}
        )
