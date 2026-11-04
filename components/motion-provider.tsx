"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * One entrance signature per language. These mirror the CSS keyframes in
 * app/i18n.css (pg-en / pg-fr / pg-ar / pg-zh), which cover the first paint.
 * This component replays them on client-side navigation, where <main> is
 * reused and the CSS animation would otherwise not run again.
 */
const ENTER: Record<
  string,
  { frames: Keyframe[]; options: KeyframeAnimationOptions }
> = {
  en: {
    frames: [
      { opacity: 0, transform: "translate3d(0, 20px, 0) scale(0.998)" },
      { opacity: 1, transform: "none" },
    ],
    options: {
      duration: 560,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "backwards",
    },
  },
  fr: {
    frames: [
      { opacity: 0, transform: "translate3d(-26px, 0, 0)" },
      { opacity: 1, transform: "none" },
    ],
    options: {
      duration: 740,
      easing: "cubic-bezier(.22,.61,.36,1)",
      fill: "backwards",
    },
  },
  ar: {
    frames: [
      { opacity: 0, transform: "translate3d(30px, 0, 0)" },
      { opacity: 1, transform: "none" },
    ],
    options: {
      duration: 700,
      easing: "cubic-bezier(.22,1,.36,1)",
      fill: "backwards",
    },
  },
  zh: {
    frames: [
      { opacity: 0, transform: "translate3d(0, 12px, 0) scale(1.004)" },
      { opacity: 1, transform: "none" },
    ],
    options: {
      duration: 880,
      easing: "cubic-bezier(.22,1,.36,1)",
      fill: "backwards",
    },
  },
};

export default function MotionProvider() {
  const pathname = usePathname();
  const locale = useLocale();
  const first = useRef(true);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (!document.documentElement.classList.contains("motion-on")) return;
    const main = document.querySelector("main");
    if (!main) return;

    // Headings reveal in readable units: characters for zh, words otherwise.
    main.querySelectorAll<HTMLElement>("h1").forEach((h) => {
      const text = (h.textContent ?? "").trim();
      const n =
        locale === "zh"
          ? [...text.replace(/\s+/g, "")].length
          : text.split(/\s+/).filter(Boolean).length;
      h.style.setProperty("--n", String(Math.max(2, Math.min(n, 40))));
    });

    // First load is already animated by CSS.
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;
    if (first.current) {
      first.current = false;
      return;
    }
    if (samePage) return;
    if (main.querySelector("[data-no-motion]")) return;

    const { frames, options } = ENTER[locale] ?? ENTER.en;
    main.animate(frames, options);
  }, [pathname, locale]);

  return null;
}
