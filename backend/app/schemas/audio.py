from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum


class MusicStyle(str, Enum):
    CINEMATIC = "cinematic"
    POP = "pop"
    ELECTRONIC = "electronic"
    CLASSICAL = "classical"
    ROCK = "rock"
    JAZZ = "jazz"
    AMBIENT = "ambient"
    CUSTOM = "custom"


class MusicMood(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    EPIC = "epic"
    CALM = "calm"
    MYSTERIOUS = "mysterious"
    ENERGETIC = "energetic"
    DRAMATIC = "dramatic"
    ROMANTIC = "romantic"


class MusicGenerationRequest(BaseModel):
    prompt: Optional[str] = Field(None, min_length=1, max_length=500)
    style: MusicStyle = MusicStyle.CINEMATIC
    mood: MusicMood = MusicMood.EPIC
    duration: float = Field(30.0, ge=10.0, le=300.0)
    lyrics: Optional[str] = Field(None, min_length=1, max_length=2000)
    instrumental: bool = False


class MusicGenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str
    estimated_time: Optional[int] = None


class MusicResult(BaseModel):
    task_id: str
    status: str
    progress: int
    audio_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    error_message: Optional[str] = None
