/**
 * Customer testimonials — the single source of truth for the homepage carousel.
 *
 * Nothing in here is generated, seeded, or filled in as an example. If this
 * array is empty the carousel does not render at all: an honest gap is better
 * than invented social proof, and the section appears automatically the moment
 * a real, authorised quote is added below.
 *
 * Before adding an entry, confirm all four:
 *   1. The quote is the customer's own words (trim for length only — no rewrite).
 *   2. The name is theirs, spelled by them, and they agreed to be named.
 *   3. The role/company line is accurate at publish time.
 *   4. If you attach a photo, you have written permission to use it.
 *
 * Shape:
 *
 *   {
 *     name: "Sara Benali",
 *     role: "SEO Lead, Northwind Studio",
 *     quote: "…their exact words…",
 *     translations: { ar: "…", fr: "…", zh: "…" }, // optional
 *     avatar: "/testimonials/sara-benali.jpg",      // optional, needs consent
 *     verified: true,                               // only when you checked it
 *   }
 */

export type Locale = "en" | "ar" | "fr" | "zh";

export type Testimonial = {
  /** Real name, as the customer writes it. */
  name: string;
  /** Verified professional role. Keep it factual and current. */
  role: string;
  /** The customer's own words. Not editorial copy. */
  quote: string;
  /** Optional translations of the same quote; English `quote` is the fallback. */
  translations?: Partial<Record<Locale, string>>;
  /** Optional approved photo, served from /public. Omit rather than fake it. */
  avatar?: string;
  /** Only set true once the identity behind the quote has actually been checked. */
  verified?: boolean;
};

/**
 * Empty on purpose — no customer reviews have been supplied and authorised yet.
 * Add entries here and the carousel returns to the homepage unchanged.
 */
export const TESTIMONIALS: Testimonial[] = [];
