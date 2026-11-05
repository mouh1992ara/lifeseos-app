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
    injected = true;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    document.head.appendChild(script);
  }, [client]);

  return null;
}
