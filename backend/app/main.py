from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger
from app.config import settings
from app.database import engine
from app.models import Base  # Will be created in models/__init__.py
from app.core.security import SecurityMiddleware
from app.core.middleware import error_handler_middleware, request_logging_middleware
from app.core.rate_limit import RateLimitMiddleware

# Create tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="全能 AI 创作工作站 - 后端 API",
        docs_url="/api/docs" if settings.debug else None,
        redoc_url="/api/redoc" if settings.debug else None,
    )

    # Security middleware (must be first)
    app.add_middleware(SecurityMiddleware)

    # Rate limiting middleware (enabled in production)
    rate_limit_enabled = settings.app_env == "production"
    app.add_middleware(RateLimitMiddleware, enabled=rate_limit_enabled)

    # Error handling middleware
    app.add_middleware(error_handler_middleware)

    # Request logging middleware
    app.add_middleware(request_logging_middleware)

    # CORS middleware
    # Parse CORS origins from environment variable
    cors_origins = settings.cors_origins
    if isinstance(cors_origins, str):
        # Split comma-separated list
        cors_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # GZip middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        logger.info(f"Starting {settings.app_name} v{settings.app_version}")
        logger.info(f"Environment: {settings.app_env}")
        logger.info(f"Debug mode: {settings.debug}")
        logger.info(f"Rate limiting enabled: {rate_limit_enabled}")
        await init_db()
        logger.info("Database initialized")

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down application")

    # Health check
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.app_name,
            "version": settings.app_version,
            "environment": settings.app_env,
        }

    # Include API routes
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
