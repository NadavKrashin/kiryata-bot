"""
Document library service.

Converts each .docx in DOCS_DIR to a self-contained HTML fragment for the
in-app reader (images embedded as data URIs), and extracts a best-effort list
of section titles (the bold / underlined headings these procedure docs use) for
a table of contents.

Deep-linking from a chat citation ("📄 מקור: <doc> › <section>") is done on the
frontend by text-searching the rendered HTML for the cited section and
scrolling/highlighting it — robust to the fact that these .docx files use
numbered lists with bold titles rather than real Word heading styles.

Everything is loaded once and memoised — restart the service after editing docs.
"""
from __future__ import annotations

import html
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import pypandoc

from app.services.ingest import DOCS_DIR

# Inner <body>…</body> of a standalone HTML document.
_BODY_RE = re.compile(r"<body\b[^>]*>(.*)</body>", re.DOTALL | re.IGNORECASE)
# Bold runs — these docs use <strong> (often with <u>) for section titles.
_STRONG_RE = re.compile(r"<strong\b[^>]*>(.*?)</strong>", re.DOTALL | re.IGNORECASE)
# Real headings, if a doc happens to use them.
_HEADING_RE = re.compile(r"<h([1-6])\b[^>]*>(.*?)</h\1>", re.DOTALL | re.IGNORECASE)
_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")

# Section-title heuristics: titles are short-ish and not full sentences.
_MIN_TITLE_LEN = 2
_MAX_TITLE_LEN = 70


@dataclass(frozen=True)
class Document:
    id: str                  # URL-safe id, e.g. "d1"
    name: str                # display name == citation name == .docx stem
    html: str                # body HTML, images embedded
    sections: tuple[str, ...]  # ordered, de-duped section titles (for a TOC)


def _slug(index: int) -> str:
    return f"d{index + 1}"


def _docx_to_body_html(path: Path) -> str:
    """Convert a .docx to an HTML body fragment, images embedded as data URIs."""
    full = pypandoc.convert_file(
        str(path),
        "html",
        extra_args=["--wrap=none", "--embed-resources", "--standalone"],
    )
    match = _BODY_RE.search(full)
    return (match.group(1) if match else full).strip()


def _plain_text(inner_html: str) -> str:
    """Inner HTML → collapsed plain text (tags stripped, entities decoded)."""
    text = _TAG_RE.sub("", inner_html)
    return _WS_RE.sub(" ", html.unescape(text)).strip()


def _extract_sections(body_html: str) -> tuple[str, ...]:
    """Best-effort, ordered, de-duped list of section titles for the TOC."""
    titles: list[str] = []
    seen: set[str] = set()

    # Real headings first (if present), then bold runs (the common case here).
    candidates = [m.group(2) for m in _HEADING_RE.finditer(body_html)]
    candidates += [m.group(1) for m in _STRONG_RE.finditer(body_html)]

    for raw in candidates:
        text = _plain_text(raw).strip(" :־-")
        if not (_MIN_TITLE_LEN <= len(text) <= _MAX_TITLE_LEN):
            continue
        key = text.casefold()
        if key in seen:
            continue
        seen.add(key)
        titles.append(text)

    return tuple(titles)


@lru_cache(maxsize=1)
def _load_documents() -> tuple[Document, ...]:
    docs: list[Document] = []
    for index, docx_path in enumerate(sorted(DOCS_DIR.glob("*.docx"))):
        body = _docx_to_body_html(docx_path)
        docs.append(
            Document(
                id=_slug(index),
                name=docx_path.stem,
                html=body,
                sections=_extract_sections(body),
            )
        )
    if not docs:
        raise RuntimeError(f"No .docx files found in {DOCS_DIR}")
    return tuple(docs)


def list_documents() -> list[dict[str, str]]:
    """Lightweight list for the library view: [{id, name}, …]."""
    return [{"id": d.id, "name": d.name} for d in _load_documents()]


def get_document(doc_id: str) -> Document | None:
    """Full document (html + section titles) by id, or None if unknown."""
    for doc in _load_documents():
        if doc.id == doc_id:
            return doc
    return None
