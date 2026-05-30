"""
╔══════════════════════════════════════════════════════════════════════╗
║                        ★  THE LLM HOOK  ★                              ║
║                                                                        ║
║  This is the ONLY file you need to touch to wire in the real bot.      ║
║                                                                        ║
║  Paste the logic from telegram_bot.py here: load the Word documents,   ║
║  build the context, call the LLM, and return the answer as a string.   ║
║                                                                        ║
║  Everything else in the app (API, validation, CORS, the typing        ║
║  animation in the frontend) already works around this function.       ║
╚══════════════════════════════════════════════════════════════════════╝
"""


def get_answer(question: str) -> str:
    """Answer a single user question.

    Args:
        question: The user's question (Hebrew text).

    Returns:
        The assistant's answer as a plain string. The frontend takes care of
        revealing it gradually (the "typing" effect), so just return the full
        text here.

    ----------------------------------------------------------------------
    TODO: Replace the placeholder below with your existing LLM logic, e.g.:

        from your_module import build_context, ask_llm

        context = build_context(question)            # from the Word docs
        return ask_llm(question, context=context)    # call the model
    ----------------------------------------------------------------------
    """
    # --- Placeholder so the whole app runs end-to-end before integration. ---
    return (
        "שלום! 👋 זוהי תשובת הדגמה זמנית.\n\n"
        f'שאלת: "{question}"\n\n'
        "כשהקוד של המודל יחובר (בקובץ backend/app/services/llm.py), "
        "כאן תופיע התשובה האמיתית עם ההקשר מתוך מסמכי הנהלים."
    )
