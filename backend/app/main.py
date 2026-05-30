"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Kiryata Bot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    """Lightweight health check for staging/production probes."""
    return {"status": "ok", "environment": settings.environment}
