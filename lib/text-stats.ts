/**
 * Shared tokenisation for the text-analysis tools.
 *
 * Two problems this fixes, both visible with real input:
 *  1. Typographic apostrophes/quotes (’ ‘ – —) were treated as punctuation and
 *     turned one word into two ("l’outil" → "l" + "outil", "don’t" → "don"+"t"),
 *     which inflated word counts and diluted every density figure on French,
 *     Arabic and copy-pasted English text.
 *  2. Chinese/Japanese have no spaces, so splitting on " " returned a single
 *     token: word count 1, density 100%, reading time 1 minute, and no keyword
 *     at all. Han/kana characters are now one token each, which is the standard
 *     approximation for CJK word counting.
 *
 * Sentence boundaries include the CJK and Arabic terminators (。！？؟ …), so
 * average sentence length is not computed as "everything is one sentence".
 */

const CJK_CHAR = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

// Han/kana first so each character is its own token; then word runs that keep
// internal apostrophes and hyphens ("don't", "e-commerce", "l'outil").
const TOKEN_RE =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|[\p{L}\p{N}]+(?:[''\-][\p{L}\p{N}]+)*/gu;

const SENTENCE_SPLIT = /[.!?…。！？؟]+/;

/** Normalises smart quotes/dashes without changing the words themselves. */
export function normaliseForAnalysis(input: string) {
  return input
    .replace(/[\u2018\u2019\u02bc\u2032]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, " ")
    .replace(/\u00a0/g, " ");
}

export function isCjkToken(token: string) {
  return CJK_CHAR.test(token);
}

export function tokenize(input: string): { words: string[]; cjkChars: number } {
  const text = normaliseForAnalysis(input).toLowerCase();
  const words = text.match(TOKEN_RE) ?? [];
  let cjkChars = 0;
  for (const word of words) {
    if (isCjkToken(word)) cjkChars += 1;
  }
  return { words, cjkChars };
}

export function countSentences(input: string) {
  const text = normaliseForAnalysis(input);
  return text
    .split(SENTENCE_SPLIT)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /[\p{L}\p{N}]/u.test(part)).length;
}

/**
 * Reading time in whole minutes. Latin text is measured at 200 words/minute and
 * CJK at 300 characters/minute, which is the usual split used for mixed copy.
 */
export function readingMinutes(wordCount: number, cjkChars: number) {
  if (wordCount <= 0) return 0;
  const latinWords = Math.max(0, wordCount - cjkChars);
  return Math.max(1, Math.ceil(latinWords / 200 + cjkChars / 300));
}
