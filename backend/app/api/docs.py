"""Docs endpoints: list the procedure documents and serve them as HTML."""
import logging

from fastapi import APIRouter, HTTPException

from app.schemas import DocumentDetail, DocumentSummary
from app.services.docs import get_document, list_documents

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/docs", tags=["docs"])


@router.get("", response_model=list[DocumentSummary])
def get_docs() -> list[DocumentSummary]:
    """List all available procedure documents (for the library view)."""
    try:
        return [DocumentSummary(**d) for d in list_documents()]
    except Exception:  # noqa: BLE001
        logger.exception("failed to list documents")
        raise HTTPException(status_code=502, detail="לא ניתן לטעון את רשימת המסמכים.")


@router.get("/{doc_id}", response_model=DocumentDetail)
def get_doc(doc_id: str) -> DocumentDetail:
    """Return a single document rendered as HTML, with its heading index."""
    try:
        doc = get_document(doc_id)
    except Exception:  # noqa: BLE001
        logger.exception("failed to render document %r", doc_id)
        raise HTTPException(status_code=502, detail="לא ניתן לטעון את המסמך.")

    if doc is None:
        raise HTTPException(status_code=404, detail="המסמך לא נמצא.")

    return DocumentDetail(
        id=doc.id,
        name=doc.name,
        html=doc.html,
        sections=list(doc.sections),
    )
