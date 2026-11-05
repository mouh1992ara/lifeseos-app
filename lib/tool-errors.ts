/**
 * Shared mapping from API error codes to translation keys.
 *
 * Every fetching endpoint answers `{ error, code }`; the UI must translate the
 * code instead of printing the English `error` string, so all four locales show
 * the same message for the same failure.
 */
export function errorCodeKey(code: unknown): string | null {
  if (typeof code !== "string" || code.length === 0) return null;

  return `codes.${code
    .toLowerCase()
    .replace(/_([a-z])/g, (_match: string, letter: string) => letter.toUpperCase())}`;
}
