const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Send a question to the backend and get the answer.
 * @param {string} question
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>} the answer text
 */
export async function askQuestion(question, signal) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    let detail = "אירעה שגיאה. נסו שוב.";
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }

  const data = await res.json();
  return data.answer;
}
