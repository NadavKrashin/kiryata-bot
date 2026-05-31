"""
╔══════════════════════════════════════════════════════════════════════╗
║                        ★  THE LLM HOOK  ★                              ║
║                                                                        ║
║  get_answer() is the single entry point the API calls. It answers a    ║
║  question strictly from the procedure documents, using Claude with     ║
║  prompt caching on the procedures + glossary block.                    ║
╚══════════════════════════════════════════════════════════════════════╝

How the caching works
---------------------
The procedures are sent as a system block with cache_control=ephemeral.
Anthropic caches it for ~5 minutes; subsequent calls within that window read
the cache at ~10% of normal input cost. For a bot with steady traffic the
cache stays warm continuously, so almost every call hits the cache.

The procedures (.docx → markdown) and the glossary are loaded once, lazily,
and memoised. If you update the documents or the glossary, restart the
service to pick up the changes.
"""
from __future__ import annotations

import logging
from functools import lru_cache

import httpx
from anthropic import Anthropic

from app.core.config import get_settings
from app.services.glossary import load_glossary_block
from app.services.ingest import load_procedures
from app.services.prompt import build_system_prompt

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_client() -> Anthropic:
    """Build the Anthropic client once, honouring optional proxy settings."""
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Add it to the backend .env to enable answers."
        )

    timeout = httpx.Timeout(settings.llm_timeout_seconds)
    if settings.llm_proxy_url:
        http_client = httpx.Client(
            proxy=settings.llm_proxy_url,
            verify=settings.llm_verify_ssl,
            timeout=timeout,
        )
    else:
        http_client = httpx.Client(verify=settings.llm_verify_ssl, timeout=timeout)

    return Anthropic(api_key=settings.anthropic_api_key, http_client=http_client)


@lru_cache(maxsize=1)
def _get_cached_payload() -> str:
    """glossary + procedures, combined into one block we ask Anthropic to cache."""
    glossary = load_glossary_block()
    procedures = load_procedures()
    return (
        (glossary + "\n\n" if glossary else "")
        + f"<procedures>\n{procedures}\n</procedures>"
    )


@lru_cache(maxsize=1)
def _get_system_instructions() -> str:
    return build_system_prompt(get_settings().contact_fallback)


def get_answer(question: str) -> str:
    """Answer a single user question (Hebrew) strictly from the procedures.

    Args:
        question: The user's question (Hebrew text).

    Returns:
        The assistant's answer as a plain string. The frontend reveals it
        gradually (the "typing" effect), so just return the full text here.
    """
    settings = get_settings()
    client = _get_client()

    response = client.messages.create(
        model=settings.llm_model,
        max_tokens=settings.llm_max_tokens,
        system=[
            # Block 1: instructions — small, no cache needed.
            {"type": "text", "text": _get_system_instructions()},
            # Block 2: glossary + procedures — CACHE THIS.
            {
                "type": "text",
                "text": _get_cached_payload(),
                "cache_control": {"type": "ephemeral"},
            },
        ],
        messages=[{"role": "user", "content": question}],
    )

    # Concatenate any text blocks in the response.
    return "".join(
        block.text for block in response.content if block.type == "text"
    ).strip()
