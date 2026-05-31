import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter.js";
import { parseAnswer } from "../lib/citations.js";
import TypingIndicator from "./TypingIndicator.jsx";
import "./MessageBubble.css";

/**
 * A single chat bubble.
 * - user messages: shown instantly, aligned to the start (right, in RTL).
 * - bot messages: citations are pulled out of the text and rendered as
 *   clickable source chips; the remaining body is revealed via the typewriter
 *   (when `animate` is true).
 */
export default function MessageBubble({ message, onTypingDone, onOpenCitation }) {
  const { role, text, pending, animate, error } = message;
  const isBot = role === "bot";

  const { body, citations } = useMemo(
    () => (isBot && !error ? parseAnswer(text) : { body: text, citations: [] }),
    [isBot, error, text]
  );

  const shown = useTypewriter(body, isBot && animate, onTypingDone);
  const display = isBot && animate ? shown : body;

  // Reveal the source chips only once the body has finished typing.
  const showCitations =
    isBot && !error && citations.length > 0 && (!animate || display === body);

  return (
    <motion.div
      className={`bubble-row bubble-row--${role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={`bubble bubble--${role}${error ? " bubble--error" : ""}`}>
        {pending ? (
          <TypingIndicator />
        ) : (
          <>
            {display && <span className="bubble__text">{display}</span>}
            {showCitations && (
              <div className="bubble__sources">
                {citations.map((c, i) => (
                  <button
                    key={`${c.doc}|${c.section}|${i}`}
                    type="button"
                    className="source-chip"
                    title={`${c.doc} › ${c.section}`}
                    onClick={() => onOpenCitation?.(c)}
                  >
                    <span className="source-chip__icon" aria-hidden="true">📄</span>
                    <span className="source-chip__text">{c.section}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
