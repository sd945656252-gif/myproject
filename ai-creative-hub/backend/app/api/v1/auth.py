"""
Authentication API endpoints.
"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import (
    ApiResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    if token is None:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=ApiResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user.
    """
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        id=uuid.uuid4(),
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email}
    )

    return ApiResponse(
        success=True,
        message="User registered successfully",
        data={
            "user": UserResponse.model_validate(new_user),
            "token": TokenResponse(
                access_token=access_token,
                token_type="bearer",
            ),
        },
    )


@router.post("/login", response_model=ApiResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Login and get access token.
    """
    # Find user
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return ApiResponse(
        success=True,
        message="Login successful",
        data={
            "user": UserResponse.model_validate(user),
            "token": TokenResponse(
                access_token=access_token,
                token_type="bearer",
            ),
        },
    )


@router.get("/me", response_model=ApiResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user information.
    """
    return ApiResponse(
        success=True,
        data=UserResponse.model_validate(current_user),
    )
