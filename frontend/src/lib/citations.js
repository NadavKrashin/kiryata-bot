// Parses the bot answer into a clean body + structured citations.
//
// The model is instructed to cite sources at the end of an answer like:
//   📄 מקור: <document name> › <section heading>
// There may be several such lines. We pull them out so the body can be typed
// without the raw citation text, and render each as a clickable source chip.

const CITATION_RE = /📄\s*מקור:\s*([^\n›>]+?)\s*[›>]\s*([^\n]+)/g;

/**
 * @param {string} text
 * @returns {{ body: string, citations: Array<{doc: string, section: string}> }}
 */
export function parseAnswer(text) {
  if (!text) return { body: "", citations: [] };

  const citations = [];
  const seen = new Set();
  let m;
  CITATION_RE.lastIndex = 0;
  while ((m = CITATION_RE.exec(text)) !== null) {
    const doc = m[1].trim();
    const section = m[2].trim().replace(/[.,;\s]+$/, "");
    const key = `${doc}|${section}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({ doc, section });
    }
  }

  const body = text
    .replace(CITATION_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { body, citations };
}
