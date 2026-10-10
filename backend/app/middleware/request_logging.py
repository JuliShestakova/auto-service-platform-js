
import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


logger = logging.getLogger("app.requests")
logger.setLevel(logging.INFO)
logger.propagate = False

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s: %(message)s"
        )
    )
    logger.addHandler(handler)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            duration = time.perf_counter() - start_time
            logger.exception(
                "%s %s failed after %.3f seconds",
                request.method,
                request.url.path,
                duration,
            )
            raise

        duration = time.perf_counter() - start_time
        logger.info(
            "%s %s -> %s (%.3f seconds)",
            request.method,
            request.url.path,
            response.status_code,
            duration,
        )

        return response
