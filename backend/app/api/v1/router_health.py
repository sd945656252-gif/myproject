from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.core.ai_router import get_router

router = APIRouter()


@router.get("/health")
async def get_router_health(db: AsyncSession = Depends(get_db)):
    """
    Get health status of all AI providers
    """
    try:
        router = await get_router()
        status = await router.get_provider_status()
        return {
            "status": "healthy",
            "providers": status,
            "total_providers": len(status),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "providers": {},
        }


@router.get("/priority")
async def get_priority_config():
    """
    Get current priority configuration for all task types
    """
    from app.core.router import MODEL_PRIORITIES
    return {
        "priorities": MODEL_PRIORITIES,
    }
