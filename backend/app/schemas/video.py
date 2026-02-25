from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Literal
from enum import Enum


class VideoModel(str, Enum):
    JIMENG_SEEDANCE = "jimeng_seedance"
    KLING_3 = "kling_3"
    VIDU_PRO = "vidu_pro"
    SORA_1 = "sora_1"
    COMFYUI_VIDEO = "comfyui_video"


class VideoTaskType(str, Enum):
    TEXT_TO_VIDEO = "text_to_video"
    IMAGE_TO_VIDEO = "image_to_video"
    VIDEO_TO_VIDEO = "video_to_video"
    UPSCALING = "upscaling"
    INTERPOLATION = "interpolation"


class TextToVideoRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000)
    negative_prompt: Optional[str] = Field(None, max_length=2000)
    duration: float = Field(5.0, ge=2.0, le=10.0)
    fps: int = Field(24, ge=12, le=60)
    width: int = Field(1280, ge=512, le=1920)
    height: int = Field(720, ge=512, le=1080)
    model: VideoModel = VideoModel.JIMENG_SEEDANCE
    seed: Optional[int] = None


class ImageToVideoRequest(BaseModel):
    image_url: HttpUrl
    prompt: Optional[str] = Field(None, min_length=1, max_length=2000)
    motion_bucket_id: int = Field(127, ge=1, le=255)
    duration: float = Field(5.0, ge=2.0, le=10.0)
    fps: int = Field(24, ge=12, le=60)
    model: VideoModel = VideoModel.JIMENG_SEEDANCE


class VideoToVideoRequest(BaseModel):
    source_video_url: HttpUrl
    prompt: str = Field(..., min_length=1, max_length=2000)
    strength: float = Field(0.7, ge=0.0, le=1.0)
    duration: Optional[float] = None


class VideoUpscalingRequest(BaseModel):
    video_url: HttpUrl
    scale_factor: Literal[2, 4] = 2
    target_resolution: Optional[Literal["1080p", "4k"]] = None


class VideoGenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str
    estimated_time: Optional[int] = None


class VideoResult(BaseModel):
    task_id: str
    status: str
    progress: int
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    error_message: Optional[str] = None
