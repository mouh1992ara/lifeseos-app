/**
 * Stable, UUID-shaped ids derived from a seed.
 *
 * `analytics_events.event_id` is a Postgres `uuid`, and it is uniquely indexed.
 * Both facts matter here:
 *
 *  - **It must be a real UUID.** Postgres rejects a malformed string with
 *    `22P02`, and `recordEvent` treats an insert error as "not stored". An id
 *    that merely *looks* UUID-ish therefore fails silently, which is the worst
 *    way for analytics to break.
 *  - **It must be stable for the same logical event.** That is what makes a
 *    retry, a double click or a re-render a no-op instead of a second row.
 *
 * FNV-1a is used for four independent 32-bit lanes, then assembled into the
 * canonical 8-4-4-4-12 layout. This is not a security primitive: the worst a
 * collision can do is merge two analytics rows.
 */
export function stableEventId(parts: (string | null | undefined)[]): string {
  const seed = parts.filter(Boolean).join("|");

  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;

  for (let i = 0; i < seed.length; i += 1) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
    h3 = Math.imul(h3 ^ c, 0xc2b2ae35) >>> 0;
    h4 = Math.imul(h4 ^ c, 0x27d4eb2f) >>> 0;
  }
  // The seed length distinguishes "a"|"bc" from "ab"|"c", which the joined
  // string alone cannot.
  h4 = (h4 ^ seed.length) >>> 0;

  const hex = (n: number) => n.toString(16).padStart(8, "0");
  const p1 = hex(h1);
  const p2 = hex(h2);
  const p3 = hex(h3);
  const p4 = hex(h4);

  // 8 - 4 - 4 - 4 - 12, with the version/variant nibbles fixed so the result is
  // recognisably a UUID rather than an arbitrary hex string.
  return `${p1}-${p2.slice(0, 4)}-4${p2.slice(4, 7)}-a${p3.slice(0, 3)}-${p3.slice(3, 8)}${p4.slice(0, 7)}`;
}
