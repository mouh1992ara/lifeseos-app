"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ENTER: Record<string, { frames: Keyframe[]; options: KeyframeAnimationOptions }> = {
  ar: {
    frames: [
      { opacity: 0, transform: "translateX(28px)" },
      { opacity: 1, transform: "none" },
    ],
    options: { duration: 700, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
  },
  zh: {
    frames: [
      { opacity: 0, transform: "translateY(10px)", filter: "blur(6px)" },
      { opacity: 1, transform: "none", filter: "blur(0px)" },
    ],
    options: { duration: 900, easing: "ease-out", fill: "backwards" },
  },
  default: {
    frames: [
      { opacity: 0, transform: "translateY(16px)" },
      { opacity: 1, transform: "none" },
    ],
    options: { duration: 600, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
  },
};

// First load is animated by pure CSS (no flash, works before hydration).
// This component handles client-side navigations and tells the CSS how many
// steps a heading reveal should use (characters for zh, words for ar).
export default function MotionProvider() {
  const pathname = usePathname();
  const locale = useLocale();
  const first = useRef(true);

  useEffect(() => {
    if (!document.documentElement.classList.contains("motion-on")) return;
    const main = document.querySelector("main");
    if (!main) return;

    main.querySelectorAll<HTMLElement>("h1").forEach((h) => {
      const text = (h.textContent ?? "").trim();
      const n =
        locale === "zh"
          ? [...text.replace(/\s+/g, "")].length
          : text.split(/\s+/).length;
      h.style.setProperty("--n", String(Math.max(2, Math.min(n, 40))));
    });

    if (first.current) {
      first.current = false;
      return;
    }
    if (main.querySelector("[data-no-motion]")) return;

    const { frames, options } = ENTER[locale] ?? ENTER.default;
    main.animate(frames, options);
  }, [pathname, locale]);

  return null;
}
