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


class DocumentSummary(BaseModel):
    id: str = Field(..., description="URL-safe document id.")
    name: str = Field(..., description="Display name (matches citation name).")


class DocumentDetail(DocumentSummary):
    html: str = Field(..., description="Body HTML (images embedded as data URIs).")
    sections: list[str] = Field(
        default_factory=list,
        description="Ordered, de-duped section titles for a table of contents.",
    )
