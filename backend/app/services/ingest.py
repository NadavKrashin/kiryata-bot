"""
Load .docx files from docs/ and convert each to markdown.
Pandoc preserves heading structure (## נוהל מקס 4 / ### סעיף 2.1), which the
model uses as citation anchors. Each doc is wrapped in a tagged block so the
prompt can reference it by name in answers.
"""
import os
from pathlib import Path

import pypandoc

# Docs live next to the app package (backend/app/docs). Override with DOCS_DIR.
_DEFAULT_DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
DOCS_DIR = Path(os.environ.get("DOCS_DIR", _DEFAULT_DOCS_DIR))


def load_procedures() -> str:
    """Return a single string containing all procedures, ready to drop into the prompt."""
    blocks: list[str] = []
    for docx_path in sorted(DOCS_DIR.glob("*.docx")):
        # Pandoc → GitHub-flavored markdown preserves headings, lists, tables.
        md = pypandoc.convert_file(str(docx_path), "gfm", extra_args=["--wrap=none"])
        # Strip empty leading/trailing whitespace per doc
        md = md.strip()
        blocks.append(f"<document name=\"{docx_path.stem}\">\n{md}\n</document>")

    if not blocks:
        raise RuntimeError(f"No .docx files found in {DOCS_DIR}")

    return "\n\n".join(blocks)


if __name__ == "__main__":
    # Quick sanity check
    text = load_procedures()
    print(f"Loaded {len(text):,} chars (~{len(text)//4:,} tokens estimate)")
    print(text[:500])
