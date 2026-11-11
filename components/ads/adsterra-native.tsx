"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adsterra native banner.
 *
 * A different protocol from the sized banners: no `atOptions`, no iframe. The
 * script finds `#container-{key}` and injects its own markup. That means it is
 * safe to run alongside the banner queue — it touches no global — but it is NOT
 * safe to run twice, because the second run appends a second widget into the
 * same container.
 *
 * The container id must be stable across client navigations for Adsterra to find
 * it, so the id is derived from the key rather than generated.
 */

const loadedNative = new Set<string>();

export type AdsterraNativeProps = {
  /** The key segment from the native banner's container id. */
  invokeKey: string;
  className?: string;
  label: string;
};

export default function AdsterraNative({
  invokeKey,
  className = "",
  label,
}: AdsterraNativeProps) {
  const [failed, setFailed] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadedNative.has(invokeKey)) return;

    const host = holderRef.current;
    if (!host) return;

    let cancelled = false;
    loadedNative.add(invokeKey);

    const script = document.createElement("script");
    script.src = `https://bauval.org/21/${invokeKey}`;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-adsterra-native", invokeKey);

    script.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    host.appendChild(script);

    /* Native fills asynchronously; if nothing appears the reservation would
       otherwise stay as a tall empty gap in the middle of an article. */
    const timer = window.setTimeout(() => {
      const container = document.getElementById(
        `container-${invokeKey}`,
      );
      if (!cancelled && (!container || container.childElementCount === 0)) {
        setFailed(true);
      }
    }, 8000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [invokeKey]);

  return (
    <div className={className} data-adsterra-native-slot={invokeKey}>
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      {/* Collapse on failure rather than leaving a labelled void. A 90px gap
          with "unavailable" under it looks like a broken site; a single short
          line does not. */}
      <div ref={holderRef} className={failed ? "" : "min-h-[90px]"}>
        {/* Adsterra targets this id directly. It must exist before the script
            runs — hence a real node in the tree rather than one created later. */}
        <div id={`container-${invokeKey}`} />
      </div>

      {failed ? (
        <p className="text-center text-[11px] text-slate-600">
          Advertisement unavailable
        </p>
      ) : null}
    </div>
  );
}