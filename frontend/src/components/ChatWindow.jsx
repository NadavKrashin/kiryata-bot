import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";
import "./ChatWindow.css";

/** Scrollable list of messages; auto-scrolls to the newest content. */
export default function ChatWindow({ messages, onTypingDone }) {
  const scrollRef = useRef(null);
  const listRef = useRef(null);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Scroll when messages change.
  useEffect(scrollToBottom, [messages]);

  // Also scroll as the list grows during the typewriter reveal.
  useEffect(() => {
    if (!listRef.current) return;
    const ro = new ResizeObserver(scrollToBottom);
    ro.observe(listRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="chat-window" ref={scrollRef}>
      <div className="chat-window__list" ref={listRef}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onTypingDone={onTypingDone} />
        ))}
      </div>
    </div>
  );
}
