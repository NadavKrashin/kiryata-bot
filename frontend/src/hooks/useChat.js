import { useCallback, useRef, useState } from "react";
import { askQuestion } from "../api/client.js";

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: "שלום! 👋 אני העוזר הדיגיטלי של קריית התקשוב.\nאפשר לשאול אותי כל שאלה על הנהלים והמקום — ואשמח לעזור.",
  animate: false,
};

let nextId = 1;
const makeId = () => `m${nextId++}`;

/**
 * Chat state machine.
 * status: "idle" | "thinking" | "typing"
 *  - thinking: request in flight (avatar "thinks", dots shown)
 *  - typing:   answer arrived and is being revealed (avatar "types")
 */
export function useChat() {
  const [messages, setMessages] = useState([WELCOME]);
  const [status, setStatus] = useState("idle");
  const abortRef = useRef(null);

  const send = useCallback(
    async (rawText) => {
      const question = rawText.trim();
      if (!question || status !== "idle") return;

      const userMsg = { id: makeId(), role: "user", text: question };
      const pendingId = makeId();
      const pendingMsg = { id: pendingId, role: "bot", text: "", pending: true };

      setMessages((prev) => [...prev, userMsg, pendingMsg]);
      setStatus("thinking");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const answer = await askQuestion(question, controller.signal);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { ...m, text: answer, pending: false, animate: true }
              : m
          )
        );
        setStatus("typing");
      } catch (err) {
        if (err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  ...m,
                  text: err.message || "אירעה שגיאה. נסו שוב בעוד רגע.",
                  pending: false,
                  animate: false,
                  error: true,
                }
              : m
          )
        );
        setStatus("idle");
      }
    },
    [status]
  );

  // Called by the bot bubble when its typewriter finishes.
  const handleTypingDone = useCallback(() => setStatus("idle"), []);

  return { messages, status, send, handleTypingDone };
}
