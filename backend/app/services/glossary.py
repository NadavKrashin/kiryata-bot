"""
Load glossary.yaml and format it for injection into the prompt.
The output is a compact block the model reads alongside the procedures.
"""
import os
from pathlib import Path

import yaml

# glossary.yaml lives next to the app package (backend/app). Override with GLOSSARY_PATH.
_DEFAULT_GLOSSARY_PATH = Path(__file__).resolve().parent.parent / "glossary.yaml"
GLOSSARY_PATH = Path(os.environ.get("GLOSSARY_PATH", _DEFAULT_GLOSSARY_PATH))


def load_glossary_block() -> str:
    """Return a formatted glossary string to drop into the prompt, or '' if no glossary."""
    if not GLOSSARY_PATH.exists():
        return ""

    data = yaml.safe_load(GLOSSARY_PATH.read_text(encoding="utf-8")) or {}

    lines: list[str] = []
    for term in data.get("terms", []) or []:
        canonical = term["canonical"]
        synonyms = " / ".join(term.get("synonyms", []))
        if synonyms:
            lines.append(f"- {canonical}  ←  {synonyms}")

    for verb in data.get("verbs", []) or []:
        canonical = verb["canonical"]
        forms = " / ".join(verb.get("forms", []))
        if forms:
            lines.append(f"- {canonical}  ←  {forms}")

    if not lines:
        return ""

    body = "\n".join(lines)
    return (
        "<glossary>\n"
        "The following terms are equivalent. The left side is how the procedures "
        "documents write it; the right side lists synonyms a user might use in a "
        "question. Treat all forms as referring to the same thing.\n\n"
        f"{body}\n"
        "</glossary>"
    )


if __name__ == "__main__":
    print(load_glossary_block())
