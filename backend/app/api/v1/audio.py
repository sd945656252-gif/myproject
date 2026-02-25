from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.audio import (
    MusicGenerationRequest,
    TTSServiceRequest,
    AudioGenerationResponse,
)
from app.services.audio_service import AudioService
from app.core.ai_router import TaskType as RouterTaskType
import uuid
import os
from app.config import get_settings

router = APIRouter()

settings = get_settings()


@router.post("/music/generate", response_model=AudioGenerationResponse)
async def generate_music(
    request: MusicGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate music using Suno AI"""
    try:
        service = AudioService(db)
        task_id = await service.generate_music(request)
        return AudioGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Music generation task queued",
            estimated_time=60
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue music generation: {str(e)}"
        )


@router.post("/music/generate-with-lyrics", response_model=AudioGenerationResponse)
async def generate_music_with_lyrics(
    prompt: str = Form(...),
    lyrics: str = Form(...),
    style: str = Form("pop"),
    mood: str = Form("upbeat"),
    duration: int = Form(180),
    instrumental: bool = Form(False),
    db: AsyncSession = Depends(get_db),
):
    """Generate music with custom lyrics using Suno"""
    try:
        request = MusicGenerationRequest(
            prompt=prompt,
            lyrics=lyrics,
            style=style,
            mood=mood,
            duration=duration,
            instrumental=instrumental,
        )

        service = AudioService(db)
        task_id = await service.generate_music(request)
        return AudioGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Music generation with lyrics task queued",
            estimated_time=90
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue music generation: {str(e)}"
        )


@router.post("/tts", response_model=AudioGenerationResponse)
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("default"),
    speed: float = Form(1.0),
    language: str = Form("zh"),
    db: AsyncSession = Depends(get_db),
):
    """Convert text to speech using Minimax TTS"""
    try:
        from app.services.voice_service import VoiceService

        request = TTSServiceRequest(
            text=text,
            voice=voice,
            speed=speed,
            language=language,
        )

        service = VoiceService(db)
        task_id = await service.text_to_speech(request)
        return AudioGenerationResponse(
            task_id=task_id,
            status="pending",
            message="TTS task queued",
            estimated_time=15
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue TTS: {str(e)}"
        )


@router.post("/tts-with-file", response_model=AudioGenerationResponse)
async def text_to_speech_with_file(
    text_file: UploadFile = File(...),
    voice: str = Form("default"),
    speed: float = Form(1.0),
    language: str = Form("zh"),
    db: AsyncSession = Depends(get_db),
):
    """Convert text file to speech"""
    try:
        # Read text from file
        content = await text_file.read()
        text = content.decode('utf-8')

        from app.services.voice_service import VoiceService

        request = TTSServiceRequest(
            text=text,
            voice=voice,
            speed=speed,
            language=language,
        )

        service = VoiceService(db)
        task_id = await service.text_to_speech(request)
        return AudioGenerationResponse(
            task_id=task_id,
            status="pending",
            message="TTS task queued",
            estimated_time=15
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue TTS: {str(e)}"
        )


@router.get("/task/{task_id}")
async def get_audio_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get audio generation task status and results"""
    try:
        from app.services.history_service import HistoryService

        history_service = HistoryService(db)
        task = await history_service.get_task_by_id(task_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return {
            "task_id": task["id"],
            "status": task["status"],
            "output_data": task["output_data"],
            "error_message": task.get("error_message"),
            "created_at": task["created_at"],
            "completed_at": task["completed_at"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}"
        )


@router.get("/voices")
async def get_available_voices(
    language: str = Query("zh", description="Language filter"),
):
    """Get available TTS voices"""
    # Mock voice list - in production, this would come from the TTS provider
    voices = {
        "zh": [
            {"id": "zh_female_1", "name": "Female Voice 1", "gender": "female"},
            {"id": "zh_male_1", "name": "Male Voice 1", "gender": "male"},
            {"id": "zh_female_2", "name": "Female Voice 2", "gender": "female"},
        ],
        "en": [
            {"id": "en_female_1", "name": "English Female 1", "gender": "female"},
            {"id": "en_male_1", "name": "English Male 1", "gender": "male"},
        ],
    }

    return {"language": language, "voices": voices.get(language, [])}


@router.get("/music-styles")
async def get_music_styles():
    """Get available music generation styles"""
    styles = [
        {"id": "pop", "name": "Pop", "description": "Modern pop music"},
        {"id": "rock", "name": "Rock", "description": "Rock and roll"},
        {"id": "jazz", "name": "Jazz", "description": "Jazz music"},
        {"id": "classical", "name": "Classical", "description": "Classical music"},
        {"id": "electronic", "name": "Electronic", "description": "Electronic music"},
        {"id": "hiphop", "name": "Hip Hop", "description": "Hip hop music"},
        {"id": "cinematic", "name": "Cinematic", "description": "Cinematic orchestral"},
        {"id": "ambient", "name": "Ambient", "description": "Ambient music"},
    ]

    return {"styles": styles}
