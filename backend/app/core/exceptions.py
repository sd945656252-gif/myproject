from fastapi import HTTPException, status


class APIException(HTTPException):
    """Base API exception"""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "API_ERROR",
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class ModelNotFoundException(APIException):
    """Model not found exception"""
    def __init__(self, model_name: str):
        super().__init__(
            detail=f"Model '{model_name}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="MODEL_NOT_FOUND",
        )


class APILimitExceededException(APIException):
    """API rate limit exceeded"""
    def __init__(self, provider: str):
        super().__init__(
            detail=f"API rate limit exceeded for provider '{provider}'",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
        )


class TaskNotFoundException(APIException):
    """Async task not found"""
    def __init__(self, task_id: str):
        super().__init__(
            detail=f"Task '{task_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="TASK_NOT_FOUND",
        )


class ValidationException(APIException):
    """Input validation failed"""
    def __init__(self, detail: str, field: str = None):
        message = f"Validation failed: {detail}"
        if field:
            message = f"Validation failed for field '{field}': {detail}"
        super().__init__(
            detail=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
        )
