import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter.js";
import TypingIndicator from "./TypingIndicator.jsx";
import "./MessageBubble.css";

/**
 * A single chat bubble.
 * - user messages: shown instantly, aligned to the start (right, in RTL).
 * - bot messages: when `pending`, show the thinking dots; otherwise reveal
 *   text via the typewriter (when `animate` is true).
 */
export default function MessageBubble({ message, onTypingDone }) {
  const { role, text, pending, animate, error } = message;
  const isBot = role === "bot";

  const shown = useTypewriter(text, isBot && animate, onTypingDone);
  const display = isBot && animate ? shown : text;

  return (
    <motion.div
      className={`bubble-row bubble-row--${role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={`bubble bubble--${role}${error ? " bubble--error" : ""}`}
      >
        {pending ? <TypingIndicator /> : <span className="bubble__text">{display}</span>}
      </div>
    </motion.div>
  );
}
