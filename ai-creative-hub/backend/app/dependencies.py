"""
Dependencies for dependency injection.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.utils.auth import decode_access_token


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
) -> Optional[str]:
    """Get current user ID from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload:
        return payload.get("sub")
    return None


async def get_current_user(
    user_id: Optional[str] = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user from database."""
    if not user_id:
        return None

    try:
        import uuid
        result = await db.execute(
            select(User).where(User.id == uuid.UUID(user_id))
        )
        return result.scalar_one_or_none()
    except Exception:
        return None
