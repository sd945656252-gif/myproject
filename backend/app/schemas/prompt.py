from pydantic import BaseModel, HttpUrl, Field
from enum import Enum
from typing import Optional, List


class OptimizationLevel(str, Enum):
    """Prompt optimization enhancement level"""
    minimal = "minimal"
    moderate = "moderate"
    maximum = "maximum"


class TargetStyle(str, Enum):
    """Target AI model for optimization"""
    midjourney = "midjourney"
    stable_diffusion = "stable_diffusion"
    dall_e = "dall_e"
    sora = "sora"


class ImageToPromptRequest(BaseModel):
    """Request to generate prompt from image"""
    image_url: HttpUrl = Field(..., description="Image URL to analyze")
    language: str = Field(default="zh", description="Output language (zh/en)")
    detail_level: str = Field(default="detailed", description="Detail level (simple/detailed/full)")


class TextOptimizationRequest(BaseModel):
    """Request to optimize text prompt"""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Original prompt to optimize")
    target_style: TargetStyle = Field(default=TargetStyle.midjourney, description="Target AI model")
    enhancement_level: OptimizationLevel = Field(default=OptimizationLevel.moderate, description="Optimization level")


class PromptResponse(BaseModel):
    """Response from prompt generation or optimization"""
    success: bool = Field(..., description="Whether the operation was successful")
    original_text: Optional[str] = Field(None, description="Original text (for optimization)")
    optimized_text: str = Field(..., description="Generated or optimized prompt")
    tags: List[str] = Field(default_factory=list, description="Extracted keywords/tags")
    meta: dict = Field(default_factory=dict, description="Additional metadata (provider, style, etc.)")
