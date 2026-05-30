"""Chat endpoint: takes a question, returns the assistant's answer."""
import logging

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse
from app.services.llm import get_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    """Answer a single user question (stateless, single-turn)."""
    try:
        answer = get_answer(request.question)
    except Exception:  # noqa: BLE001 - surface a clean error, log the detail
        logger.exception("get_answer failed for question=%r", request.question)
        raise HTTPException(
            status_code=502,
            detail="אירעה שגיאה בעת קבלת התשובה. נסו שוב בעוד רגע.",
        )

    return ChatResponse(answer=answer)
