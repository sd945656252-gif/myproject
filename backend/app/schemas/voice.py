from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Literal
from enum import Enum


class VoiceGender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    CHILD = "child"


class VoiceAge(str, Enum):
    YOUNG = "young"
    ADULT = "adult"
    SENIOR = "senior"


class TTSModel(str, Enum):
    MINIMAX_SPEECH_01 = "minimax_speech_01"
    OPENAI_TTS_1 = "openai_tts_1"
    OPENAI_TTS_1_HD = "openai_tts_1_hd"


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    voice: str = Field("default", description="Voice ID or name")
    model: TTSModel = TTSModel.MINIMAX_SPEECH_01
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pitch: float = Field(1.0, ge=0.5, le=2.0)
    output_format: Literal["mp3", "wav", "flac"] = "mp3"


class VoiceCloneRequest(BaseModel):
    reference_audio_url: HttpUrl
    text: str = Field(..., min_length=1, max_length=10000)
    model: TTSModel = TTSModel.MINIMAX_SPEECH_01
    speed: float = Field(1.0, ge=0.5, le=2.0)
    output_format: Literal["mp3", "wav", "flac"] = "mp3"


class TTSResponse(BaseModel):
    task_id: str
    status: str
    message: str
    estimated_time: Optional[int] = None


class TTSResult(BaseModel):
    task_id: str
    status: str
    progress: int
    audio_url: Optional[str] = None
    duration: Optional[float] = None
    error_message: Optional[str] = None
