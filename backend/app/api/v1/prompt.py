from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.prompt import (
    ImageToPromptRequest,
    TextOptimizationRequest,
    PromptResponse,
)
from app.services.prompt_service import PromptService

router = APIRouter()


@router.post("/image-to-text", response_model=PromptResponse)
async def image_to_prompt(
    image_url: str = Form(...),
    language: str = Form("zh"),
    detail_level: str = Form("detailed"),
    db: AsyncSession = Depends(get_db),
):
    """
    Reverse engineer prompt from image using vision models
    """
    try:
        service = PromptService(db)
        request = ImageToPromptRequest(
            image_url=image_url,
            language=language,
            detail_level=detail_level,
        )
        result = await service.image_to_prompt(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt from image: {str(e)}"
        )


@router.post("/optimize", response_model=PromptResponse)
async def optimize_prompt(
    prompt: str = Form(...),
    target_style: str = Form("midjourney"),
    enhancement_level: str = Form("moderate"),
    db: AsyncSession = Depends(get_db),
):
    """
    Optimize prompt for specific AI models (Midjourney, Stable Diffusion, etc.)
    """
    try:
        service = PromptService(db)
        request = TextOptimizationRequest(
            prompt=prompt,
            target_style=target_style,
            enhancement_level=enhancement_level,
        )
        result = await service.optimize_prompt(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize prompt: {str(e)}"
        )


@router.post("/upload-and-analyze", response_model=PromptResponse)
async def upload_and_analyze(
    image: UploadFile = File(...),
    language: str = Form("zh"),
    detail_level: str = Form("detailed"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload image and analyze to generate prompt
    """
    try:
        # Upload image first
        from app.api.v1.image import _upload_image
        image_url = await _upload_image(image)

        # Analyze image
        service = PromptService(db)
        request = ImageToPromptRequest(
            image_url=image_url,
            language=language,
            detail_level=detail_level,
        )
        result = await service.image_to_prompt(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze image: {str(e)}"
        )
