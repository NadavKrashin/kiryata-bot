import { useState } from "react";
import "./MessageInput.css";

/**
 * The composer. Enter sends; Shift+Enter adds a newline. Disabled while the
 * bot is busy so a user can't fire overlapping requests.
 */
export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="composer">
      <textarea
        className="composer__input"
        placeholder="הקלידו שאלה..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        dir="rtl"
        aria-label="תיבת שאלה"
      />
      <button
        className="composer__send"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="שליחה"
        title="שליחה"
      >
        {/* Paper-plane icon, mirrored for RTL */}
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.4 11.1 4.6 3.2c-.7-.3-1.5.4-1.3 1.2L5 11l9 1-9 1-1.7 6.6c-.2.8.6 1.5 1.3 1.2l16.8-7.9c.8-.4.8-1.5 0-1.8z"
          />
        </svg>
      </button>
    </div>
  );
}
