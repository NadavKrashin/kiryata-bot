import "./TypingIndicator.css";

/** Three animated dots shown while the bot is "thinking". */
export default function TypingIndicator() {
  return (
    <span className="typing-dots" aria-label="חושב...">
      <span />
      <span />
      <span />
    </span>
  );
}
