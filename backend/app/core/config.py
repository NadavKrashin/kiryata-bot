"""Application configuration, loaded from environment variables / .env files.

Keeping config env-driven means the same code runs unchanged across
local, staging, and production — only the .env file differs.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Free-form label for the running environment.
    environment: str = "local"

    # CORS: comma-separated list of allowed frontend origins.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- LLM (Anthropic Claude) ------------------------------------------
    # Required to answer real questions. Without it the server still starts,
    # but /api/chat will return a clean error.
    anthropic_api_key: str = ""

    # Model id. Swap to claude-haiku-4-5 for cheaper / faster answers.
    llm_model: str = "claude-sonnet-4-5"

    # Max tokens for the answer.
    llm_max_tokens: int = 1024

    # Who to contact when the answer isn't in the procedures (used in prompt).
    contact_fallback: str = "הממונה הישיר"

    # Optional outbound HTTP proxy for the Anthropic API (org networks).
    # Leave empty to connect directly.
    llm_proxy_url: str = ""

    # Verify TLS certificates on the Anthropic connection. Set false only if
    # an intercepting proxy forces it (matches the original bot's behaviour).
    llm_verify_ssl: bool = True

    # Request timeout (seconds) for the Anthropic API call.
    llm_timeout_seconds: float = 60.0

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
