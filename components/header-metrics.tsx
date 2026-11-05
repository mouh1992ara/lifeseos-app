"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Publishes the real header height as `--header-h` on <html>.
 *
 * The header has three different heights (desktop row, a narrower row that
 * wraps, and the two-row mobile bar) and its exact value also depends on the
 * active font and locale. Hard-coding a pixel offset in CSS gets it wrong at
 * some width; measuring it and publishing the number is correct everywhere.
 *
 * Consumers: the sticky category rail on /tools and `scroll-padding-top`, so
 * in-page anchors land below the header instead of behind it.
 *
 * Two details matter for correctness:
 *   - it re-runs on every navigation, because the header is a server component
 *     and React can replace the DOM node entirely. A ResizeObserver pointed at
 *     the old node never fires again and the variable silently goes stale.
 *   - it re-measures after webfonts settle, since the header's own text can
 *     change the row height once the real font is in.
 */
export default function HeaderMetrics() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const measure = () => {
      // Always re-query: the node may have been replaced since last time.
      const header = document.querySelector<HTMLElement>("header.site-header");
      if (!header) return;

      const h = Math.round(header.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty("--header-h", `${h}px`);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();

    const header = document.querySelector<HTMLElement>("header.site-header");
    const ro = new ResizeObserver(schedule);
    if (header) ro.observe(header);

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    // Fonts and late layout shifts can still change the row height.
    const settle = window.setTimeout(measure, 400);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [pathname]);

  return null;
}