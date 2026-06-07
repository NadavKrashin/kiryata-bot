// Empty string → same-origin relative calls (e.g. "/api/chat"), which lets the
// frontend's nginx reverse-proxy them to the backend over the cluster-internal
// Service. `??` (not `||`) so an intentionally empty value is preserved; only an
// undefined var (e.g. local `vite dev`) falls back to the dev backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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

/**
 * List all available procedure documents.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function getDocuments() {
  const res = await fetch(`${BASE_URL}/api/docs`);
  if (!res.ok) throw new Error("לא ניתן לטעון את רשימת המסמכים.");
  return res.json();
}

/**
 * Fetch a single document rendered as HTML, with its section titles.
 * @param {string} id
 * @returns {Promise<{id: string, name: string, html: string, sections: string[]}>}
 */
export async function getDocument(id) {
  const res = await fetch(`${BASE_URL}/api/docs/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("לא ניתן לטעון את המסמך.");
  return res.json();
}
