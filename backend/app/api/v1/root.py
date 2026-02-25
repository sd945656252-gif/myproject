from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running"
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.app_env
    }


@router.get("/api-info")
async def api_info():
    """API information and available endpoints"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "endpoints": {
            "prompt": {
                "image_to_text": "POST /api/v1/prompt/image-to-text",
                "optimize": "POST /api/v1/prompt/optimize",
                "upload_and_analyze": "POST /api/v1/prompt/upload-and-analyze",
            },
            "image": {
                "text_to_image": "POST /api/v1/image/text-to-image",
                "image_to_image": "POST /api/v1/image/image-to-image",
                "inpainting": "POST /api/v1/image/inpainting",
                "controlnet": "POST /api/v1/image/controlnet",
            }
        }
    }
