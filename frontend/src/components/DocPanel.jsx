import { useEffect, useRef, useState } from "react";
import { getDocument } from "../api/client.js";
import { highlightSection } from "../lib/docMatch.js";
import "./DocPanel.css";

/**
 * Side panel that shows the procedure documents.
 * - No `docId`  → the library list (pick a document).
 * - With `docId` → the document rendered as HTML, scrolled/highlighted to the
 *   cited `target.section` when one is provided.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Array<{id,name}>} props.documents
 * @param {string|null} props.docId          currently open document, or null for the list
 * @param {{doc:string, section:string}|null} props.target  section to jump to
 * @param {(id:string)=>void} props.onSelectDoc
 * @param {()=>void} props.onBackToList
 * @param {()=>void} props.onClose
 */
export default function DocPanel({
  open,
  documents,
  docId,
  target,
  onSelectDoc,
  onBackToList,
  onClose,
}) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  // Fetch the document whenever the selected id changes.
  useEffect(() => {
    if (!docId) {
      setDoc(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDoc(null);
    getDocument(docId)
      .then((d) => !cancelled && setDoc(d))
      .catch((e) => !cancelled && setError(e.message || "שגיאה בטעינת המסמך."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [docId]);

  // After the HTML is in the DOM, jump to the cited section (or top).
  useEffect(() => {
    if (!doc || !contentRef.current) return;
    const el = contentRef.current;
    const raf = requestAnimationFrame(() => {
      if (!target?.section || !highlightSection(el, target.section)) {
        el.scrollTop = 0;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [doc, target]);

  return (
    <aside className={`docpanel${open ? " docpanel--open" : ""}`} aria-hidden={!open}>
      <header className="docpanel__bar">
        {docId ? (
          <button type="button" className="docpanel__btn" onClick={onBackToList}>
            ⟶ כל המסמכים
          </button>
        ) : (
          <span className="docpanel__btn docpanel__btn--ghost" />
        )}
        <span className="docpanel__title">
          {docId ? doc?.name ?? "טוען…" : "מסמכי הנהלים"}
        </span>
        <button
          type="button"
          className="docpanel__btn docpanel__close"
          onClick={onClose}
          aria-label="סגירה"
        >
          ✕
        </button>
      </header>

      {!docId ? (
        <div className="docpanel__list">
          {documents.length === 0 && (
            <p className="docpanel__msg">אין מסמכים זמינים.</p>
          )}
          {documents.map((d) => (
            <button
              key={d.id}
              type="button"
              className="doc-card"
              onClick={() => onSelectDoc(d.id)}
            >
              <span className="doc-card__icon" aria-hidden="true">📄</span>
              <span className="doc-card__name">{d.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="docpanel__reader">
          {loading && <p className="docpanel__msg">טוען מסמך…</p>}
          {error && <p className="docpanel__msg docpanel__msg--err">{error}</p>}
          {doc && (
            <>
              {doc.sections?.length > 0 && (
                <details className="docpanel__toc">
                  <summary>תוכן עניינים</summary>
                  <div className="docpanel__toc-list">
                    {doc.sections.map((s, i) => (
                      <button
                        key={`${s}-${i}`}
                        type="button"
                        className="toc-link"
                        onClick={() => highlightSection(contentRef.current, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </details>
              )}
              <div
                ref={contentRef}
                className="docpanel__content doc-html"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: doc.html }}
              />
            </>
          )}
        </div>
      )}
    </aside>
  );
}
