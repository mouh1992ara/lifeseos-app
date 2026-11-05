"use client";

import { useEffect } from "react";

/**
 * Scroll-triggered stagger for any set of elements.
 *
 * Sets `data-in="0"` on each match, then flips it to `"1"` as the element
 * enters the viewport. CSS owns the transition and reads `--sd` for the
 * per-item delay, so the markup and the grid layout stay untouched.
 *
 * A safety timer forces everything visible if the observer never fires, so
 * content can never be trapped at opacity 0.
 */
export default function ScrollStagger({
  selector,
  step = 70,
  max = 5,
  sections = true,
}: {
  selector: string;
  step?: number;
  max?: number;
  /** Also reveal top-level <section>s when scroll-timeline is unavailable. */
  sections?: boolean;
}) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    const reduced = !document.documentElement.classList.contains("motion-on");
    if (reduced) {
      els.forEach((el) => el.setAttribute("data-in", "1"));
      return;
    }

    els.forEach((el, i) => {
      el.setAttribute("data-in", "0");
      el.style.setProperty("--sd", `${Math.min(i, max) * step}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "1");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    els.forEach((el) => io.observe(el));

    const safety = setTimeout(() => {
      els.forEach((el) => {
        if (el.getAttribute("data-in") === "0") el.setAttribute("data-in", "1");
      });
    }, 2600);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, [selector, step, max]);

  /**
   * Section reveal fallback.
   *
   * Section entrances are normally driven by CSS scroll-driven animations
   * (`animation-timeline: view()`), which only Chromium implements. Where it is
   * missing, sections would simply appear with no reveal at all — not broken,
   * but the page loses its rhythm. This observes the same sections and drives
   * the identical `[data-in]` transition that the rest of the page already
   * uses, so both paths end in the same visual state.
   *
   * It is skipped entirely when the browser supports scroll-timeline, so
   * Chromium keeps the native, scroll-linked behaviour.
   */
  useEffect(() => {
    if (!sections) return;
    if (typeof CSS === "undefined" || CSS.supports?.("animation-timeline: view()")) return;
    if (!document.documentElement.classList.contains("motion-on")) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("main section:not(section section)"),
    ).filter((el) => !el.hasAttribute("data-in"));

    if (!targets.length) return;

    targets.forEach((el) => el.setAttribute("data-in", "0"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "1");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((el) => io.observe(el));

    // Safety: content must never be stuck invisible.
    const safety = setTimeout(() => {
      targets.forEach((el) => {
        if (el.getAttribute("data-in") === "0") el.setAttribute("data-in", "1");
      });
    }, 2600);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, [sections]);

  return null;
}
