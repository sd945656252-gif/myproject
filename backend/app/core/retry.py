import asyncio
import time
from typing import Callable, TypeVar, Generic
from functools import wraps
from loguru import logger
from app.core.exceptions import APILimitExceededException

T = TypeVar('T')


class RetryStrategy:
    """Retry configuration"""
    def __init__(
        self,
        max_attempts: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 10.0,
        backoff_factor: float = 2.0,
        retryable_exceptions: tuple = (Exception,),
    ):
        self.max_attempts = max_attempts
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
        self.retryable_exceptions = retryable_exceptions


def retry_with_fallback(
    strategy: RetryStrategy = None,
    fallback_handler: Callable = None,
):
    """
    Decorator for retry with automatic fallback
    """
    if strategy is None:
        strategy = RetryStrategy()

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> T:
            delay = strategy.initial_delay
            last_exception = None

            for attempt in range(1, strategy.max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except strategy.retryable_exceptions as e:
                    last_exception = e

                    if attempt == strategy.max_attempts:
                        logger.error(
                            f"Function '{func.__name__}' failed after {attempt} attempts: {str(e)}"
                        )
                        # Try fallback if available
                        if fallback_handler:
                            logger.info(f"Attempting fallback for '{func.__name__}'")
                            try:
                                return await fallback_handler(*args, **kwargs)
                            except Exception as fallback_error:
                                logger.error(f"Fallback also failed: {str(fallback_error)}")
                                raise fallback_error
                        raise

                    # Check if it's a rate limit error
                    if isinstance(e, APILimitExceededException):
                        delay = min(delay * strategy.backoff_factor, strategy.max_delay)
                        logger.warning(
                            f"Rate limit hit for '{func.__name__}'. Retrying in {delay}s "
                            f"(attempt {attempt}/{strategy.max_attempts})"
                        )
                    else:
                        logger.warning(
                            f"Function '{func.__name__}' failed (attempt {attempt}/{strategy.max_attempts}): {str(e)}"
                        )

                    await asyncio.sleep(delay)

        return async_wrapper
    return decorator
