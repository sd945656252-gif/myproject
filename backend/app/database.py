from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()

# Create async engine with optimized connection pool
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    # Optimized connection pool settings for production
    pool_size=10,              # Reduced from 20 to 10 for better resource utilization
    max_overflow=5,            # Reduced from 10 to 5
    pool_pre_ping=True,        # Enable connection health checks
    pool_recycle=3600,         # Recycle connections after 1 hour
    pool_timeout=30,           # Connection acquisition timeout (seconds)
    connect_args={
        "server_settings": {
            "application_name": settings.app_name,
        }
    },
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


# Dependency to get DB session
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
