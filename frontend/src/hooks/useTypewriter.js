import { useEffect, useRef, useState } from "react";

/**
 * Gradually reveal `text` character-by-character (the "typing" effect).
 * When `active` is false, the full text is shown immediately.
 *
 * @param {string} text       full text to reveal
 * @param {boolean} active    whether to animate (vs. show instantly)
 * @param {() => void} onDone  called once when revealing completes
 * @param {number} speed       ms per step
 */
export function useTypewriter(text, active, onDone, speed = 18) {
  const [shown, setShown] = useState(active ? "" : text);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    // Reveal a few characters per tick so long answers don't drag.
    const step = Math.max(1, Math.round(text.length / 400));
    const timer = setInterval(() => {
      i += step;
      if (i >= text.length) {
        setShown(text);
        clearInterval(timer);
        onDoneRef.current?.();
      } else {
        setShown(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);

  return shown;
}
