"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

import AdsterraBanner from "./adsterra-banner";
import AdsterraNative from "./adsterra-native";
import {
  ADSTERRA_ENABLED,
  AD_CONSENT_COOKIE,
  AD_UNITS,
  isAdExcludedPath,
  type AdUnitId,
} from "@/lib/ads/config";

/**
 * Single entry point for ad slots.
 *
 * Every decision that could put a third-party script on the page lives here:
 * the feature flag, the consent check, the excluded-path check and the viewport
 * check. Pages just say which unit they want.
 *
 * Consent is read from a cookie rather than the network because the prompt that
 * sets it is a separate, removable component — if that component is deleted, the
 * cookie is never set and ads simply never render. That is the safe direction to
 * fail.
 */

const LABELS: Record<string, string> = {
  en: "Advertisement",
  ar: "إعلان",
  fr: "Publicité",
  zh: "广告",
};

function readConsent(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AD_CONSENT_COOKIE}=([^;]*)`),
  );
  return match?.[1] === "granted";
}

/** Matches once on mount and then on resize; no polling. */
function useViewport() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

export type AdSlotProps = {
  unit: AdUnitId;
  /** `inline` may only be used where the container is at least 300px wide. */
  className?: string;
};

export default function AdSlot({ unit, className }: AdSlotProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const width = useViewport();
  const [consented, setConsented] = useState(false);

  // Read the cookie after mount: reading it during render would make the server
  // and client disagree and produce a hydration error.
  useEffect(() => {
    setConsented(readConsent());
  }, []);

  if (!ADSTERRA_ENABLED) return null;
  if (!consented) return null;
  if (isAdExcludedPath(pathname)) return null;

  /* `usePathname` from next-intl returns the path with the locale already
     stripped, so the locale has to come from `useLocale` — reading segment 0
     gave "blog" or "tools" and silently fell back to English. */
  const label = LABELS[locale] ?? LABELS.en;

  const spec = AD_UNITS[unit];

  // Nothing renders until the viewport is known — reserving space for an ad
  // that will be hidden is worse than a brief gap.
  if (width === null) return null;

  const isMobile = width < 768;

  if (unit === "leaderboard") {
    // Desktop only. A 728px iframe cannot fit a phone, and scaling it down keeps
    // the 728 req alive for a creative nobody can read.
    if (isMobile || width < 768) return null;
    return (
      <AdsterraBanner
        invokeKey={spec.invokeKey}
        size={{ width: spec.width, height: spec.height }}
        label={label}
        className={className}
      />
    );
  }

  if (unit === "mobile") {
    // Mobile only, and only in normal flow — never fixed/sticky, so it can
    // never cover a tool input or a navigation control.
    if (!isMobile) return null;
    return (
      <AdsterraBanner
        invokeKey={spec.invokeKey}
        size={{ width: spec.width, height: spec.height }}
        label={label}
        className={className}
      />
    );
  }

  if (unit === "inline") {
    // 300px of creative inside a padded column leaves ~24px of slack on a 360px
    // phone; below 90.5% of the container the iframe would clip.
    if (width < 360) return null;
    return (
      <AdsterraBanner
        invokeKey={spec.invokeKey}
        size={{ width: spec.width, height: spec.height }}
        label={label}
        className={className}
      />
    );
  }

  return <AdsterraNative invokeKey={spec.invokeKey} label={label} className={className} />;
}