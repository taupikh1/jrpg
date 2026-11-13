/**
 * Word-wrap helpers for canvas text. Pure functions: the measure callback is
 * injected so the logic can be unit-tested without a canvas context.
 */

/**
 * Split text into lines no wider than maxWidth, breaking on spaces.
 * A single word wider than maxWidth is hard-split by characters.
 * Explicit "\n" in the text starts a new line.
 * @param {string} text
 * @param {number} maxWidth
 * @param {(s: string) => number} measure - returns rendered width in px
 * @returns {string[]}
 */
export function wrapLines(text, maxWidth, measure) {
  const out = [];
  const paragraphs = String(text ?? '').split('\n');
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) out.push(line);
      line = '';
      // hard-split a word that alone exceeds the width
      let chunk = '';
      for (const ch of word) {
        if (measure(chunk + ch) > maxWidth && chunk) {
          out.push(chunk);
          chunk = ch;
        } else {
          chunk += ch;
        }
      }
      line = chunk;
    }
    if (line) out.push(line);
  }
  return out;
}
