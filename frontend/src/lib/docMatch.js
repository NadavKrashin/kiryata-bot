// Helpers for deep-linking a citation into a rendered document.
//
// These procedure docs use numbered lists with bold section titles (not Word
// heading styles), so there are no stable heading anchors. Instead we match the
// cited section text against the rendered HTML and scroll/highlight the most
// specific element that contains it.

const NIQQUD = /[֑-ׇ]/g;
const PUNCT = /["'״׳`.,:;()\[\]{}<>!?\/\\|–—\-]/g;

export const HIGHLIGHT_CLASS = "doc-hit";
const SELECTOR = "h1,h2,h3,h4,h5,h6,p,li,td,th,strong,blockquote";

/** Normalize Hebrew text for fuzzy matching (strip niqqud, quotes, punctuation). */
export function normalizeHebrew(s) {
  return (s || "")
    .replace(NIQQUD, "")
    .replace(PUNCT, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** From a "A › B › C" citation section, take the most specific (last) part. */
export function sectionTarget(section) {
  const parts = (section || "")
    .split(/[›>]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts[parts.length - 1] : (section || "");
}

/**
 * Find the element best matching `query` inside `container`, scroll it into
 * view and highlight it. Returns true if something was matched.
 * @param {HTMLElement} container
 * @param {string} query  citation section text (may be a "A › B" path)
 */
export function highlightSection(container, query) {
  if (!container || !query) return false;

  const target = normalizeHebrew(sectionTarget(query));
  if (!target) return false;

  const els = Array.from(container.querySelectorAll(SELECTOR));
  let best = null;
  let bestLen = Infinity;

  // Prefer the shortest element that contains the target text — that's the
  // section title itself rather than the whole paragraph/section around it.
  for (const el of els) {
    const t = normalizeHebrew(el.textContent);
    if (!t) continue;
    const contains =
      t.includes(target) || (target.length > 8 && t.length > 6 && target.includes(t));
    if (contains && t.length < bestLen) {
      best = el;
      bestLen = t.length;
    }
  }

  // Fallback: match by majority of words for paraphrased / partial citations.
  if (!best) {
    const words = target.split(" ").filter((w) => w.length > 1);
    if (words.length > 1) {
      const need = Math.ceil(words.length * 0.7);
      for (const el of els) {
        const t = normalizeHebrew(el.textContent);
        if (!t) continue;
        const hits = words.filter((w) => t.includes(w)).length;
        if (hits >= need && t.length < bestLen) {
          best = el;
          bestLen = t.length;
        }
      }
    }
  }

  if (!best) return false;

  container
    .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    .forEach((e) => e.classList.remove(HIGHLIGHT_CLASS));
  best.classList.add(HIGHLIGHT_CLASS);
  best.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
}
