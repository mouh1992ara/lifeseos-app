"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";

import { ADSTERRA_ENABLED, AD_CONSENT_COOKIE, isAdExcludedPath } from "@/lib/ads/config";

/**
 * Consent prompt for third-party advertising.
 *
 * Nothing is loaded before an explicit choice: the ad components read
 * `ls_ads_consent=granted` and refuse to render without it, and this component is
 * the only thing that writes that cookie. Refusing also records `denied` rather
 * than setting nothing, so the prompt does not reappear on every navigation.
 *
 * Deliberately not a full CMP. It asks one question and stores one answer; that is
 * proportionate for a trial of one ad network, and a fake-looking consent
 * management platform would be worse than an honest small prompt.
 */

const COPY: Record<string, { title: string; body: string; accept: string; decline: string }> = {
  en: {
    title: "Advertisement cookies",
    body: "We would like to show ads from a third-party network to test advertising on this site. This sets cookies from that network. Nothing loads unless you agree.",
    accept: "Allow ads",
    decline: "No thanks",
  },
  ar: {
    title: "ملفات تعريف الارتباط للإعلانات",
    body: "نودّ عرض إعلانات من شبكة خارجية لاختبار الإعلانات على هذا الموقع. يؤدي ذلك إلى تعيين ملفات تعريف ارتباط من تلك الشبكة. لا يتم تحميل أي شيء ما لم توافق.",
    accept: "السماح بالإعلانات",
    decline: "لا شكرًا",
  },
  fr: {
    title: "Cookies publicitaires",
    body: "Nous souhaitons afficher des annonces d'un réseau tiers pour tester la publicité sur ce site. Cela dépose des cookies de ce réseau. Rien ne se charge sans votre accord.",
    accept: "Autoriser les annonces",
    decline: "Non merci",
  },
  zh: {
    title: "广告 Cookie",
    body: "我们希望展示来自第三方广告网络的广告，用于测试本站的广告效果。这会设置该网络的 Cookie。在你同意之前不会加载任何内容。",
    accept: "允许广告",
    decline: "不用了",
  },
};

function hasDecision(): boolean {
  if (typeof document === "undefined") return true;
  return new RegExp(`(?:^|;\\s*)${AD_CONSENT_COOKIE}=`).test(document.cookie);
}

function setConsent(value: "granted" | "denied") {
  // 180 days; the experiment will be over well before then.
  document.cookie = `${AD_CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

export default function AdConsent() {
  const pathname = usePathname();
  const locale = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ADSTERRA_ENABLED) return;
    if (isAdExcludedPath(pathname)) return;
    if (hasDecision()) return;
    setShow(true);
  }, [pathname]);

  if (!ADSTERRA_ENABLED || !show) return null;
  if (isAdExcludedPath(pathname)) return null;

  /* Same reason as AdSlot: the pathname has no locale prefix here. */
  const t = COPY[locale] ?? COPY.en;

  const decide = (value: "granted" | "denied") => {
    setConsent(value);
    setShow(false);
    // The ad slots read the cookie on mount, so a decision made after they
    // rendered needs a reload to take effect. Reloading is honest; silently
    // patching state would leave the slot and the cookie disagreeing.
    if (value === "granted") window.location.reload();
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:p-5"
    >
      <p className="text-sm font-semibold text-white">{t.title}</p>
      <p className="mt-1.5 text-[13px] leading-6 text-slate-300">{t.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          {t.accept}
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30"
        >
          {t.decline}
        </button>
      </div>
    </div>
  );
}