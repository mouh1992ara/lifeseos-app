"use client";

import { useEffect } from "react";

/**
 * Loads Google AdSense after React has hydrated.
 *
 * Two constraints shaped this:
 *   - In `<head>` as a plain async script, AdSense runs while React is still
 *     hydrating and annotates DOM nodes as it scans; React then reports
 *     "a tree hydrated but some attributes didn't match" on ordinary elements.
 *   - Via `next/script`, the injected `<script>` carries a `data-nscript`
 *     attribute that the AdSense loader rejects ("AdSense head tag doesn't
 *     support data-nscript attribute").
 *
 * Appending the tag ourselves from an effect satisfies both: it lands after
 * hydration and the element is exactly what AdSense expects — the loader
 * rejects any custom attribute, even a `data-` one used for deduping.
 */
/* Deduped with a module flag rather than a `data-` attribute: the AdSense
   loader validates the tag and warns on any attribute beyond async/src/
   crossorigin. */
let injected = false;

export default function AdSense({ client }: { client: string }) {
  useEffect(() => {
    if (!client || injected) return;

    let cancelled = false;
    const timers: number[] = [];

    const inject = () => {
      if (cancelled || injected) return;
      injected = true;
      timers.forEach((id) => window.clearTimeout(id));

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      document.head.appendChild(script);
    };

    // Ads used to be injected the moment React hydrated, which put ~256 KB of
    // third-party JavaScript on the critical path of every tool page (measured:
    // load 7.3 s on a throttled mobile profile). They are now appended once the
    // page has loaded and the main thread is idle; the timeout guarantees the
    // script still loads on pages where `load` never fires (long-polling, aborted
    // images). Ad slots are unaffected — they fill when the script arrives.
    const schedule = () => {
      const idle = window.requestIdleCallback;
      if (typeof idle === "function") {
        idle(inject, { timeout: 2500 });
      } else {
        window.setTimeout(inject, 300);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    timers.push(window.setTimeout(inject, 6000));

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [client]);

  return null;
}
