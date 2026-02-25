"""
Rate Limiting Middleware - Redis-based Sliding Window Implementation
"""
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Optional
import asyncio
import time
from loguru import logger
from app.config import get_settings

settings = get_settings()


class RateLimiter:
    """
    Rate limiter using Redis with sliding window algorithm
    """

    def __init__(self, redis_client=None):
        self.redis_client = redis_client

    async def is_allowed(
        self,
        key: str,
        limit: int,
        window: int
    ) -> tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed using sliding window

        Args:
            key: Rate limit key (e.g., IP address, user ID)
            limit: Maximum number of requests
            window: Time window in seconds

        Returns:
            (is_allowed, info): Tuple of allowed status and info dict
        """
        try:
            if self.redis_client:
                return await self._redis_sliding_window(key, limit, window)
            else:
                # Fallback to in-memory rate limiting
                return self._memory_sliding_window(key, limit, window)
        except Exception as e:
            logger.error(f"Rate limit check failed: {str(e)}")
            # Fail open: allow request if rate limiter fails
            return True, {"limit": limit, "remaining": 1, "reset": int(time.time()) + window}

    async def _redis_sliding_window(
        self,
        key: str,
        limit: int,
        window: int
    ) -> tuple[bool, Dict[str, int]]:
        """Redis-based sliding window implementation"""
        import redis.asyncio as redis

        if not self.redis_client:
            self.redis_client = await redis.from_url(settings.redis_url)

        now = time.time()
        window_start = now - window
        redis_key = f"rate_limit:{key}"

        # Remove old entries
        await self.redis_client.zremrangebyscore(redis_key, 0, window_start)

        # Count current requests
        current = await self.redis_client.zcard(redis_key)

        if current >= limit:
            # Rate limit exceeded
            ttl = await self.redis_client.ttl(redis_key)
            reset_at = int(now + max(ttl, 0))
            return False, {
                "limit": limit,
                "remaining": 0,
                "reset": reset_at
            }

        # Add current request
        await self.redis_client.zadd(redis_key, {str(now): now})

        # Set expiry
        await self.redis_client.expire(redis_key, window)

        # Get remaining
        remaining = limit - current - 1

        return True, {
            "limit": limit,
            "remaining": remaining,
            "reset": int(now + window)
        }

    def _memory_sliding_window(
        self,
        key: str,
        limit: int,
        window: int
    ) -> tuple[bool, Dict[str, int]]:
        """In-memory sliding window implementation (fallback)"""
        import threading

        if not hasattr(self, "_memory_store"):
            self._memory_store: Dict[str, list] = {}
            self._lock = threading.Lock()

        now = time.time()
        window_start = now - window

        with self._lock:
            if key not in self._memory_store:
                self._memory_store[key] = []

            # Remove old entries
            self._memory_store[key] = [
                t for t in self._memory_store[key]
                if t > window_start
            ]

            current = len(self._memory_store[key])

            if current >= limit:
                # Rate limit exceeded
                oldest = min(self._memory_store[key]) if self._memory_store[key] else now
                reset_at = int(oldest + window)
                return False, {
                    "limit": limit,
                    "remaining": 0,
                    "reset": reset_at
                }

            # Add current request
            self._memory_store[key].append(now)

            remaining = limit - current - 1

            return True, {
                "limit": limit,
                "remaining": remaining,
                "reset": int(now + window)
            }


# Rate limit rules configuration
RATE_LIMIT_RULES = {
    "default": {"limit": 100, "window": 60},  # 100 requests per minute
    "api": {"limit": 60, "window": 60},       # 60 API calls per minute
    "upload": {"limit": 10, "window": 60},    # 10 uploads per minute
    "generation": {"limit": 20, "window": 60}, # 20 generation tasks per minute
}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware for FastAPI
    """

    def __init__(self, app, redis_client=None, enabled: bool = True):
        super().__init__(app)
        self.rate_limiter = RateLimiter(redis_client)
        self.enabled = enabled

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self.enabled:
            return await call_next(request)

        # Determine rate limit key and rule
        client_ip = self._get_client_ip(request)
        rule_name = self._get_rate_limit_rule(request)
        rule = RATE_LIMIT_RULES.get(rule_name, RATE_LIMIT_RULES["default"])

        # Build unique key
        rate_limit_key = f"{rule_name}:{client_ip}"

        # Check rate limit
        is_allowed, info = await self.rate_limiter.is_allowed(
            rate_limit_key,
            rule["limit"],
            rule["window"]
        )

        if not is_allowed:
            logger.warning(
                f"Rate limit exceeded for {client_ip} on {request.url.path} "
                f"(rule: {rule_name}, limit: {rule['limit']}/{rule['window']}s)"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": str(info["remaining"]),
                    "X-RateLimit-Reset": str(info["reset"]),
                    "Retry-After": str(info["reset"] - int(time.time()))
                }
            )

        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset"])

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # Check for real IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fall back to direct IP
        return request.client.host if request.client else "unknown"

    def _get_rate_limit_rule(self, request: Request) -> str:
        """Determine rate limit rule based on request path"""
        path = request.url.path.lower()

        # Generation endpoints
        if any(x in path for x in ["/image/", "/video/", "/audio/", "/music/", "/tts"]):
            return "generation"

        # Upload endpoints
        if "upload" in path or request.method in ["POST", "PUT", "PATCH"]:
            # Check content-type for file uploads
            content_type = request.headers.get("content-type", "")
            if "multipart" in content_type:
                return "upload"

        # API endpoints
        if path.startswith("/api/"):
            return "api"

        # Default rule
        return "default"


# Export functions for manual rate limiting
async def check_rate_limit(
    key: str,
    limit: int,
    window: int,
    redis_client=None
) -> tuple[bool, Dict[str, int]]:
    """
    Check rate limit manually

    Usage:
        allowed, info = await check_rate_limit("user:123", 10, 60)
        if not allowed:
            raise HTTPException(429, "Rate limit exceeded")
    """
    limiter = RateLimiter(redis_client)
    return await limiter.is_allowed(key, limit, window)
