from fastapi import Request, status
from fastapi.responses import JSONResponse
from loguru import logger
import time
import uuid
from typing import Callable


async def error_handler_middleware(request: Request, call_next: Callable):
    """
    Global error handling middleware
    """
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # Generate request ID for tracking
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))

        logger.error(
            f"Unhandled error [RequestID: {request_id}]: {str(e)}",
            exc_info=True,
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "error_type": type(e).__name__,
            }
        )

        # Return structured error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "error_type": type(e).__name__,
                "request_id": request_id,
            }
        )


async def request_logging_middleware(request: Request, call_next: Callable):
    """
    Enhanced request/response logging middleware with security audit
    """
    # Generate unique request ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    start_time = time.time()

    # Extract client information
    client_ip = request.client.host if request.client else "unknown"

    # Check for forwarded headers (proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    real_ip = request.headers.get("X-Real-IP")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    elif real_ip:
        client_ip = real_ip

    # Log request with enhanced information
    log_data = {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query_params": str(request.query_params),
        "client_ip": client_ip,
        "user_agent": request.headers.get("user-agent", "unknown"),
    }

    # Log sensitive operations
    if request.method in ["POST", "PUT", "DELETE"]:
        log_data["content_type"] = request.headers.get("content-type", "unknown")
        logger.info(f"[SECURITY] Sensitive operation: {request.method} {request.url.path}", extra=log_data)

    logger.info(f"Request [ID: {request_id}]: {request.method} {request.url.path}", extra=log_data)

    # Process request
    try:
        response = await call_next(request)
    except Exception as e:
        # Log error with request ID
        logger.error(
            f"Request failed [ID: {request_id}]: {str(e)}",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "error": str(e),
            }
        )
        raise

    # Calculate processing time
    process_time = time.time() - start_time

    # Log response with enhanced information
    response_log_data = {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "process_time": round(process_time, 3),
        "client_ip": client_ip,
    }

    # Log slow requests (> 1 second)
    if process_time > 1.0:
        logger.warning(f"Slow request [ID: {request_id}]", extra=response_log_data)
    else:
        logger.info(f"Response [ID: {request_id}]: {response.status_code}", extra=response_log_data)

    # Add headers to response
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(round(process_time, 3))

    return response
