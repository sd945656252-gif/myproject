"""
File upload validation utilities
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from loguru import logger
from app.config import get_settings

settings = get_settings()


# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"}

# MIME type to extension mapping
MIME_TYPE_MAP = {
    # Images
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    # Videos
    "video/mp4": ".mp4",
    "video/avi": ".avi",
    "video/quicktime": ".mov",
    "video/x-matroska": ".mkv",
    "video/webm": ".webm",
    # Audio
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "audio/aac": ".aac",
    "audio/mp4": ".m4a",
}

# Magic bytes (file signatures) for validation
MAGIC_BYTES = {
    # Images
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"RIFF": "video/webm",  # WebM/AVI
    # Videos
    b"\x00\x00\x00\x18ftypmp42": "video/mp4",
    b"\x00\x00\x00\x1cftypisom": "video/mp4",
    # Audio
    b"ID3": "audio/mpeg",  # MP3
    b"\xff\xfb": "audio/mpeg",  # MP3
    b"RIFF": "audio/wav",  # WAV (also used for video)
    b"fLaC": "audio/flac",
}


def validate_file_extension(filename: str, allowed_extensions: set) -> str:
    """
    Validate file extension

    Returns:
        Lowercase extension with dot (e.g., ".jpg")
    """
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    # Extract extension
    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(allowed_extensions)}"
        )

    return ext


def validate_mime_type(file: UploadFile, expected_types: list) -> None:
    """
    Validate file MIME type from content-type header
    """
    if not file.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Content-Type header"
        )

    if file.content_type not in expected_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type: {file.content_type}. Expected: {', '.join(expected_types)}"
        )


async def validate_file_content(file: UploadFile, expected_mime: str) -> None:
    """
    Validate file content using magic bytes

    This is more secure than relying on Content-Type header
    """
    # Read first 12 bytes for magic byte detection
    chunk = await file.read(12)
    await file.seek(0)  # Reset file pointer

    # Check magic bytes
    for magic, mime in MAGIC_BYTES.items():
        if chunk.startswith(magic):
            # Special handling for RIFF (can be WAV or WebM/AVI)
            if mime == "image/webp" and expected_mime.startswith("video/"):
                # It's video/webm
                return
            elif mime == "audio/wav" and expected_mime.startswith("audio/"):
                # It's WAV
                return
            elif mime == expected_mime:
                return

    # If no magic bytes match or mismatch, log warning but don't reject
    # (Some formats may not have reliable magic bytes)
    logger.warning(
        f"Could not verify file content with magic bytes. "
        f"Expected: {expected_mime}, File: {file.filename}"
    )


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks
    """
    # Remove directory separators
    filename = filename.replace("/", "").replace("\\", "")

    # Remove special characters that could be problematic
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")

    # Limit filename length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:245] + ext

    return filename


async def upload_file(
    file: UploadFile,
    upload_dir: str,
    allowed_extensions: set,
    expected_mime_prefix: str,
    max_size: Optional[int] = None
) -> str:
    """
    Generic file upload with comprehensive validation

    Args:
        file: UploadFile object
        upload_dir: Directory to upload to
        allowed_extensions: Set of allowed file extensions
        expected_mime_prefix: Expected MIME type prefix (e.g., "image/")
        max_size: Maximum file size in bytes

    Returns:
        URL/path to uploaded file
    """
    # Validate file size
    file_size = 0
    chunk_size = 8192

    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)

    # Validate extension
    ext = validate_file_extension(file.filename, allowed_extensions)

    # Validate MIME type
    expected_mimes = [mime for mime in MIME_TYPE_MAP.keys() if mime.startswith(expected_mime_prefix)]
    if expected_mimes:
        validate_mime_type(file, expected_mimes)

    # Validate content with magic bytes
    expected_mime = MIME_TYPE_MAP.get(file.content_type, "")
    if expected_mime and expected_mime.startswith(expected_mime_prefix):
        try:
            await validate_file_content(file, expected_mime)
        except Exception as e:
            logger.warning(f"Magic byte validation failed: {str(e)}")

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Read and validate file while writing
    try:
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break

                file_size += len(chunk)

                # Check file size limit
                max_size = max_size or settings.max_upload_size
                if file_size > max_size:
                    # Delete partial file
                    buffer.close()
                    if os.path.exists(file_path):
                        os.remove(file_path)

                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File size exceeds maximum allowed size of {max_size} bytes"
                    )

                buffer.write(chunk)

    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )

    logger.info(
        f"File uploaded successfully: {unique_filename} "
        f"(size: {file_size} bytes, type: {file.content_type})"
    )

    # Return URL (in production, this would be a cloud storage URL)
    return f"/uploads/{unique_filename}"


async def upload_image(file: UploadFile) -> str:
    """Upload and validate image file"""
    return await upload_file(
        file,
        settings.upload_dir,
        ALLOWED_IMAGE_EXTENSIONS,
        "image/",
        max_size=10 * 1024 * 1024  # 10MB
    )


async def upload_video(file: UploadFile) -> str:
    """Upload and validate video file"""
    return await upload_file(
        file,
        settings.upload_dir,
        ALLOWED_VIDEO_EXTENSIONS,
        "video/",
        max_size=100 * 1024 * 1024  # 100MB
    )


async def upload_audio(file: UploadFile) -> str:
    """Upload and validate audio file"""
    return await upload_file(
        file,
        settings.upload_dir,
        ALLOWED_AUDIO_EXTENSIONS,
        "audio/",
        max_size=20 * 1024 * 1024  # 20MB
    )
