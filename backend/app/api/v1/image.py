from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.image import (
    TextToImageRequest,
    ImageToImageRequest,
    InpaintingRequest,
    ControlNetRequest,
    ImageGenerationResponse,
)
from app.services.image_service import ImageService
from app.utils.file_upload import upload_image
from app.config import get_settings

router = APIRouter()

settings = get_settings()


@router.post("/text-to-image", response_model=ImageGenerationResponse)
async def text_to_image(
    request: TextToImageRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate image from text prompt using AI Router priority system
    """
    try:
        service = ImageService(db)
        task_id = await service.text_to_image(request)
        return ImageGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Image generation task queued",
            estimated_time=30
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue image generation: {str(e)}"
        )


@router.post("/image-to-image", response_model=ImageGenerationResponse)
async def image_to_image(
    source_image: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.75),
    negative_prompt: str = Form(None),
    steps: int = Form(30),
    cfg_scale: float = Form(7.5),
    seed: int = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate new image based on source image
    """
    try:
        # Upload source image with validation
        image_url = await upload_image(source_image)

        request = ImageToImageRequest(
            source_image_url=image_url,
            prompt=prompt,
            strength=strength,
            negative_prompt=negative_prompt,
            steps=steps,
            cfg_scale=cfg_scale,
            seed=seed,
        )

        service = ImageService(db)
        task_id = await service.image_to_image(request)
        return ImageGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Image-to-image task queued",
            estimated_time=45
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue image generation: {str(e)}"
        )


@router.post("/inpainting", response_model=ImageGenerationResponse)
async def inpainting(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form(...),
    negative_prompt: str = Form(None),
    strength: float = Form(0.9),
    db: AsyncSession = Depends(get_db),
):
    """
    Local image inpainting with mask
    """
    try:
        # Upload images with validation
        image_url = await upload_image(image)
        mask_url = await upload_image(mask)

        request = InpaintingRequest(
            image_url=image_url,
            mask_url=mask_url,
            prompt=prompt,
            negative_prompt=negative_prompt,
            strength=strength,
        )

        service = ImageService(db)
        task_id = await service.inpainting(request)
        return ImageGenerationResponse(
            task_id=task_id,
            status="pending",
            message="Inpainting task queued",
            estimated_time=40
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue inpainting: {str(e)}"
        )


@router.post("/controlnet", response_model=ImageGenerationResponse)
async def controlnet(
    source_image: UploadFile = File(...),
    prompt: str = Form(...),
    control_type: str = Form("pose"),
    control_weight: float = Form(1.0),
    negative_prompt: str = Form(None),
    steps: int = Form(30),
    db: AsyncSession = Depends(get_db),
):
    """
    ControlNet-based image generation with pose/structure control
    """
    try:
        # Upload source image with validation
        image_url = await upload_image(source_image)

        request = ControlNetRequest(
            source_image_url=image_url,
            prompt=prompt,
            control_type=control_type,
            control_weight=control_weight,
            negative_prompt=negative_prompt,
            steps=steps,
        )

        service = ImageService(db)
        task_id = await service.controlnet(request)
        return ImageGenerationResponse(
            task_id=task_id,
            status="pending",
            message="ControlNet task queued",
            estimated_time=50
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue ControlNet generation: {str(e)}"
        )
