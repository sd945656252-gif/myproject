"""
AI Router - Retry middleware with exponential backoff.
"""
import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Callable, Optional
import random

from loguru import logger


class RetryStrategy(str, Enum):
    """Retry strategy types."""

    FIXED = "fixed"
    EXPONENTIAL = "exponential"
    LINEAR = "linear"


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""

    max_retries: int = 3
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL
    base_delay: float = 1.0
    max_delay: float = 60.0
    jitter: bool = True
    retryable_errors: list[str] = field(
        default_factory=lambda: [
            "timeout",
            "rate_limit",
            "service_unavailable",
            "internal_error",
            "connection_error",
        ]
    )


@dataclass
class RetryResult:
    """Result of retry execution."""

    success: bool
    attempts: int
    total_delay: float
    last_error: Optional[str] = None
    retry_history: list[dict] = field(default_factory=list)


class RetryMiddleware:
    """Middleware for retrying failed API calls."""

    def __init__(self, config: RetryConfig | None = None):
        self.config = config or RetryConfig()
        self._rate_limits: dict[str, datetime] = {}

    def calculate_delay(self, attempt: int) -> float:
        """Calculate delay before next retry."""
        if self.config.strategy == RetryStrategy.FIXED:
            delay = self.config.base_delay

        elif self.config.strategy == RetryStrategy.EXPONENTIAL:
            delay = self.config.base_delay * (2 ** (attempt - 1))

        elif self.config.strategy == RetryStrategy.LINEAR:
            delay = self.config.base_delay * attempt

        else:
            delay = self.config.base_delay

        # Apply max delay cap
        delay = min(delay, self.config.max_delay)

        # Add jitter to prevent thundering herd
        if self.config.jitter:
            delay = delay * (0.5 + random.random())

        return delay

    def is_retryable_error(self, error: str) -> bool:
        """Check if error is retryable."""
        error_lower = error.lower()
        return any(e in error_lower for e in self.config.retryable_errors)

    def set_rate_limit(self, provider: str, retry_after: int = 60) -> None:
        """Set rate limit for a provider."""
        self._rate_limits[provider] = datetime.utcnow() + timedelta(seconds=retry_after)

    def is_rate_limited(self, provider: str) -> bool:
        """Check if provider is rate limited."""
        if provider not in self._rate_limits:
            return False
        return datetime.utcnow() < self._rate_limits[provider]

    async def execute_with_retry(
        self,
        func: Callable,
        provider: str,
        *args,
        **kwargs,
    ) -> RetryResult:
        """Execute function with retry logic."""
        result = RetryResult(success=False, attempts=0, total_delay=0)

        # Check rate limit
        if self.is_rate_limited(provider):
            result.last_error = f"Provider {provider} is rate limited"
            return result

        for attempt in range(1, self.config.max_retries + 1):
            result.attempts = attempt

            try:
                # Execute the function
                if asyncio.iscoroutinefunction(func):
                    response = await func(*args, **kwargs)
                else:
                    response = func(*args, **kwargs)

                result.success = True
                return result

            except Exception as e:
                error_str = str(e)
                result.last_error = error_str

                # Log retry attempt
                retry_info = {
                    "attempt": attempt,
                    "error": error_str,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                result.retry_history.append(retry_info)

                logger.warning(
                    f"Retry attempt {attempt}/{self.config.max_retries} "
                    f"for {provider}: {error_str}"
                )

                # Check if we should retry
                if not self.is_retryable_error(error_str):
                    logger.error(f"Non-retryable error for {provider}: {error_str}")
                    return result

                # Check for rate limit
                if "rate_limit" in error_str.lower() or "429" in error_str:
                    self.set_rate_limit(provider)
                    result.last_error = f"Rate limited: {provider}"
                    return result

                # Calculate and apply delay
                if attempt < self.config.max_retries:
                    delay = self.calculate_delay(attempt)
                    result.total_delay += delay
                    await asyncio.sleep(delay)

        return result


class RateLimiter:
    """Token bucket rate limiter for API calls."""

    def __init__(
        self,
        rate: int = 60,
        period: int = 60,
        burst: int | None = None,
    ):
        self.rate = rate
        self.period = period
        self.burst = burst or rate
        self._tokens = float(self.burst)
        self._last_update = datetime.utcnow()
        self._lock = asyncio.Lock()

    async def acquire(self, tokens: int = 1) -> bool:
        """Acquire tokens from the bucket."""
        async with self._lock:
            now = datetime.utcnow()
            elapsed = (now - self._last_update).total_seconds()
            self._last_update = now

            # Replenish tokens
            self._tokens = min(
                self.burst,
                self._tokens + elapsed * (self.rate / self.period),
            )

            if self._tokens >= tokens:
                self._tokens -= tokens
                return True

            return False

    async def wait_for_token(self, tokens: int = 1) -> None:
        """Wait until tokens are available."""
        while not await self.acquire(tokens):
            await asyncio.sleep(0.1)


# Global rate limiters for each provider
_rate_limiters: dict[str, RateLimiter] = {}


def get_rate_limiter(provider: str, rate: int = 60, period: int = 60) -> RateLimiter:
    """Get or create a rate limiter for a provider."""
    if provider not in _rate_limiters:
        _rate_limiters[provider] = RateLimiter(rate=rate, period=period)
    return _rate_limiters[provider]
