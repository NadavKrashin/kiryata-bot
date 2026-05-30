"""Request/response models for the chat API."""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's question, in Hebrew.",
    )


class ChatResponse(BaseModel):
    answer: str = Field(..., description="The assistant's answer.")
