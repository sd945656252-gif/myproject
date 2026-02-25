"""
Security Middleware - OWASP Security Headers Implementation
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger
import os


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Security Middleware that adds OWASP recommended security headers
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Content Security Policy (CSP)
        # Prevents Cross-Site Scripting (XSS) and data injection attacks
        # Configured to allow inline scripts for development
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "img-src 'self' data: blob: https://*.githubusercontent.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "connect-src 'self' https://api.openai.com https://*.huggingface.co; "
            "frame-ancestors 'none'; "
            "form-action 'self';"
        )
        response.headers["Content-Security-Policy"] = csp_policy

        # Strict-Transport-Security (HSTS)
        # Enforces HTTPS connections
        # Set to 1 year max-age with includeSubDomains
        env = os.getenv("APP_ENV", "development")
        if env == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        else:
            # Lower max-age for development
            response.headers["Strict-Transport-Security"] = "max-age=3600"

        # X-Content-Type-Options
        # Prevents MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # X-Frame-Options
        # Prevents clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"

        # X-XSS-Protection
        # Enables XSS filter in modern browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer-Policy
        # Controls how much referrer information is sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions-Policy
        # Controls browser features and APIs
        permissions_policy = (
            "camera=(), "
            "microphone=(), "
            "geolocation=(), "
            "fullscreen=(self), "
            "payment=()"
        )
        response.headers["Permissions-Policy"] = permissions_policy

        # Server Header
        # Removes server information disclosure
        response.headers["Server"] = "AI-Creative-Hub"

        # X-Powered-By
        # Removes technology stack disclosure
        response.headers.pop("X-Powered-By", None)

        logger.debug(f"Security headers applied to {request.url.path}")

        return response


class SecurityHeaders:
    """
    Security headers configuration helper
    """

    @staticmethod
    def get_headers(env: str = "production") -> dict:
        """Get all security headers as a dictionary"""
        headers = {
            "Content-Security-Policy": SecurityHeaders._get_csp_policy(env),
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=(), fullscreen=(self), payment=()",
            "Server": "AI-Creative-Hub",
        }

        if env == "production":
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        else:
            headers["Strict-Transport-Security"] = "max-age=3600"

        return headers

    @staticmethod
    def _get_csp_policy(env: str) -> str:
        """Get CSP policy based on environment"""
        if env == "production":
            return (
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net; "
                "style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
                "img-src 'self' data: blob:; "
                "font-src 'self' data: https://fonts.gstatic.com; "
                "connect-src 'self' https://api.openai.com https://*.huggingface.co; "
                "frame-ancestors 'none'; "
                "form-action 'self';"
            )
        else:
            # Allow unsafe-inline for development (React, etc.)
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
                "img-src 'self' data: blob: https://*.githubusercontent.com; "
                "font-src 'self' data: https://fonts.gstatic.com; "
                "connect-src 'self' https://api.openai.com https://*.huggingface.co; "
                "frame-ancestors 'none'; "
                "form-action 'self';"
            )
