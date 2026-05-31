import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "./components/Avatar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import DocPanel from "./components/DocPanel.jsx";
import MessageInput from "./components/MessageInput.jsx";
import { getDocuments } from "./api/client.js";
import { useChat } from "./hooks/useChat.js";
import { normalizeHebrew } from "./lib/docMatch.js";
import "./App.css";

const STATUS_TEXT = {
  idle: "מוכן לשאלות שלכם",
  thinking: "חושב על התשובה...",
  typing: "כותב תשובה...",
};

/** Resolve a citation's document name to a known document id. */
function resolveDocId(documents, name) {
  const target = normalizeHebrew(name);
  if (!target) return null;
  let partial = null;
  for (const d of documents) {
    const n = normalizeHebrew(d.name);
    if (n === target) return d.id;
    if (partial === null && (n.includes(target) || target.includes(n))) partial = d.id;
  }
  return partial;
}

export default function App() {
  const { messages, status, send, handleTypingDone } = useChat();

  const [documents, setDocuments] = useState([]);
  const [docOpen, setDocOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null); // null → library list
  const [target, setTarget] = useState(null); // {doc, section} to jump to

  // Load the document list once.
  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, []);

  const docsById = useMemo(
    () => new Map(documents.map((d) => [d.id, d])),
    [documents]
  );

  const openLibrary = useCallback(() => {
    setActiveDocId(null);
    setTarget(null);
    setDocOpen(true);
  }, []);

  const openCitation = useCallback(
    (citation) => {
      const id = resolveDocId(documents, citation.doc);
      setActiveDocId(id); // null falls back to the library list
      setTarget(id ? citation : null);
      setDocOpen(true);
    },
    [documents]
  );

  const selectDoc = useCallback((id) => {
    setActiveDocId(id);
    setTarget(null);
  }, []);

  const backToList = useCallback(() => {
    setActiveDocId(null);
    setTarget(null);
  }, []);

  const closePanel = useCallback(() => setDocOpen(false), []);

  return (
    <div className={`app${docOpen ? " app--doc-open" : ""}`}>
      <div className="app__chat">
        <header className="app__header">
          <Avatar state={status} size={64} />
          <div className="app__titles">
            <h1 className="app__title">קריית התקשוב</h1>
            <p className="app__status">{STATUS_TEXT[status]}</p>
          </div>
          <button
            type="button"
            className="app__docs-btn"
            onClick={openLibrary}
            aria-label="מסמכי הנהלים"
          >
            <span aria-hidden="true">📄</span> מסמכים
          </button>
        </header>

        <main className="app__main">
          <ChatWindow
            messages={messages}
            onTypingDone={handleTypingDone}
            onOpenCitation={openCitation}
          />
        </main>

        <footer className="app__footer">
          <MessageInput onSend={send} disabled={status !== "idle"} />
          <p className="app__credit">פותח על ידי סגל תכנות כחול של״ז</p>
        </footer>
      </div>

      <DocPanel
        open={docOpen}
        documents={documents}
        docId={activeDocId}
        target={target}
        onSelectDoc={selectDoc}
        onBackToList={backToList}
        onClose={closePanel}
      />
    </div>
  );
}
