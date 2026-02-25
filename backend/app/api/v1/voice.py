from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.voice import (
    TTSRequest,
    VoiceCloneRequest,
    TTSResponse,
)
from app.services.voice_service import VoiceService

router = APIRouter()


@router.post("/speak", response_model=TTSResponse)
async def text_to_speech(
    request: TTSRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Convert text to speech using Minimax or OpenAI
    """
    try:
        service = VoiceService(db)
        task_id = await service.text_to_speech(request)
        return TTSResponse(
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


@router.post("/clone", response_model=TTSResponse)
async def voice_clone(
    request: VoiceCloneRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Clone voice from reference audio and generate new speech
    """
    try:
        service = VoiceService(db)
        task_id = await service.voice_clone(request)
        return TTSResponse(
            task_id=task_id,
            status="pending",
            message="Voice cloning task queued",
            estimated_time=30
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue voice cloning: {str(e)}"
        )
