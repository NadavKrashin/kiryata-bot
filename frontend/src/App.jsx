import Avatar from "./components/Avatar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import MessageInput from "./components/MessageInput.jsx";
import { useChat } from "./hooks/useChat.js";
import "./App.css";

const STATUS_TEXT = {
  idle: "מוכן לשאלות שלכם",
  thinking: "חושב על התשובה...",
  typing: "כותב תשובה...",
};

export default function App() {
  const { messages, status, send, handleTypingDone } = useChat();

  return (
    <div className="app">
      <header className="app__header">
        <Avatar state={status} size={64} />
        <div className="app__titles">
          <h1 className="app__title">קריית התקשוב</h1>
          <p className="app__status">{STATUS_TEXT[status]}</p>
        </div>
      </header>

      <main className="app__main">
        <ChatWindow messages={messages} onTypingDone={handleTypingDone} />
      </main>

      <footer className="app__footer">
        <MessageInput onSend={send} disabled={status !== "idle"} />
        <p className="app__credit">פותח על ידי סגל תכנות כחול של״ז</p>
      </footer>
    </div>
  );
}
