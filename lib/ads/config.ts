/**
 * Adsterra configuration and kill switch.
 *
 * Everything here is inert unless `NEXT_PUBLIC_ADSTERRA_ENABLED === "true"`.
 * With the flag off, no ad component renders, no script is created and no
 * request leaves the browser — the pages are byte-for-byte what they were
 * before this integration.
 *
 * To remove advertising entirely before an AdSense review:
 *   1. set NEXT_PUBLIC_ADSTERRA_ENABLED=false (or delete the variable), and
 *   2. delete the `<AdSlot …/>` call sites listed in docs/ads.md.
 * Both steps are independent, so a mistake in one cannot leak a request.
 */

export const ADSTERRA_ENABLED =
  process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true";

/** Cookie set by the consent prompt. Absent or "denied" means no ads. */
export const AD_CONSENT_COOKIE = "ls_ads_consent";

export type AdUnitId = "native" | "inline" | "leaderboard" | "mobile";

type AdUnit = {
  /** Key from the Adsterra unit's configuration object. */
  invokeKey: string;
  /** Which Adsterra endpoint serves this format. */
  path: "21" | "22";
  width: number;
  height: number;
};

export const AD_UNITS: Record<AdUnitId, AdUnit> = {
  /** Native banner, 4:1, inherits font. Served from /21/ with a container div. */
  native: {
    invokeKey: "7644ccaace1af4e7c7e2a2660f027722",
    path: "21",
    width: 0,
    height: 0,
  },
  /** 300x250 in-content rectangle. */
  inline: {
    invokeKey: "ac8ee1594c3dea537e75bf4d03e844c7",
    path: "22",
    width: 300,
    height: 250,
  },
  /** 728x90 leaderboard, desktop only. */
  leaderboard: {
    invokeKey: "da73eddd2924f5c3b78aa3140098ea22",
    path: "22",
    width: 728,
    height: 90,
  },
  /** 320x50 mobile anchor-in-flow banner. */
  mobile: {
    invokeKey: "ad8fe2ed58d47911482d38b5256749f7",
    path: "22",
    width: 320,
    height: 50,
  },
};

/**
 * Units that exist in the Adsterra dashboard but are deliberately NOT wired.
 *
 * `27a00f8f2ddbb0a31288dad6b6191a78` (`/14/`) was supplied alongside the four
 * approved units. `/14/` in Adsterra is the popunder/social-bar loader family,
 * both of which are excluded from this experiment, so it is documented here and
 * never rendered. Do not add it without an explicit instruction — a popunder is
 * exactly the kind of creative that gets an AdSense application rejected.
 */
export const EXCLUDED_UNITS = [
  {
    key: "27a00f8f2ddbb0a31288dad6b6191a78",
    path: "14",
    reason: "Popunder / Social Bar family — excluded by the experiment brief.",
  },
] as const;

/** Pages that must never carry advertising. */
export const AD_EXCLUDED_SEGMENTS = [
  "auth",
  "admin",
  "dashboard",
  "privacy",
  "terms",
  "editorial",
  "protected",
] as const;

export function isAdExcludedPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  // Drop a leading locale so /fr/privacy is treated like /privacy.
  const first = ["en", "ar", "fr", "zh"].includes(parts[0]) ? parts[1] : parts[0];
  return AD_EXCLUDED_SEGMENTS.includes(
    first as (typeof AD_EXCLUDED_SEGMENTS)[number],
  );
}