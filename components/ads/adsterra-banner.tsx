"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adsterra ad slot.
 *
 * The hard part is not the markup, it is `atOptions`. Adsterra's banner loader
 * reads a **global** `window.atOptions` at execution time, and the loader script
 * is identical for every banner (`https://bauval.org/22/{key}`). So two banners on
 * one page collide: the second script reads whichever `atOptions` was written
 * last, and one slot renders the wrong size — or the same ad twice.
 *
 * Four constraints follow from that, and this component is shaped by them:
 *
 *  1. `atOptions` must be set immediately before its own loader runs, never
 *     earlier, so nothing can overwrite it in between.
 *  2. Loaders must never run concurrently. We serialise them through a single
 *     promise chain per document.
 *  3. Each loader must be inserted exactly once per key. Re-running it on
 *     client navigation re-executes the ad request and Adsterra counts a second
 *     impression for the same slot.
 *  4. The container must already have its final height before the iframe is
 *     written, or the page jumps when the creative arrives.
 *
 * The native banner is a different protocol (`datadome`-style div injection, no
 * `atOptions`), so it is handled in its own component — mixing them in one
 * global would be the exact collision described above.
 */

/** Serialises banner loaders so `atOptions` is never read by the wrong script. */
let bannerQueue: Promise<void> = Promise.resolve();

/** Keys whose loader has already been inserted into this document. */
const loadedKeys = new Set<string>();

type BannerSize = { width: number; height: number };

export type AdsterraBannerProps = {
  /** The Adsterra invoke key from the unit's configuration object. */
  invokeKey: string;
  size: BannerSize;
  /**
   * Re-render on viewport changes instead of using CSS alone. A 728x90 iframe
   * scaled down by CSS still requests and renders the 728px creative, which
   * wastes bandwidth and looks broken; unmounting is the honest behaviour.
   */
  visible?: boolean;
  className?: string;
  /** Label text; supplied by the caller so it can be translated. */
  label: string;
};

export default function AdsterraBanner({
  invokeKey,
  size,
  visible = true,
  className = "",
  label,
}: AdsterraBannerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const host = mountRef.current;
    if (!host || loadedKeys.has(invokeKey)) return;

    let cancelled = false;

    bannerQueue = bannerQueue.then(
      () =>
        new Promise<void>((resolve) => {
          if (cancelled || !mountRef.current) return resolve();

          /* Adsterra writes the iframe into this element. If the element has
             already been replaced by a re-render, the ad lands nowhere and the
             slot stays blank with no error — so re-read the ref here rather
             than trusting the closure. */
          const node = mountRef.current;
          if (!node) return resolve();

          loadedKeys.add(invokeKey);

          const options = {
            key: invokeKey,
            format: "iframe",
            height: size.height,
            width: size.width,
            params: {},
          };

          /* Assigned on window, not declared: the loader does a bare
             `atOptions` lookup, which resolves against the global object. */
          (window as unknown as { atOptions: typeof options }).atOptions = options;

          const script = document.createElement("script");
          script.src = `https://bauval.org/22/${invokeKey}`;
          script.async = true;
          script.setAttribute("data-adsterra", invokeKey);

          script.onerror = () => {
            if (!cancelled) setFailed(true);
            resolve();
          };
          script.onload = () => resolve();

          host.appendChild(script);

          /* If the creative is blocked by an extension or a network rule the
             script may load without producing an iframe. Detecting that lets us
             collapse the reserved space instead of leaving a labelled void. */
          window.setTimeout(() => {
            if (!cancelled && host.childElementCount === 0) setFailed(true);
            resolve();
          }, 6000);
        }),
    );

    return () => {
      cancelled = true;
    };
  }, [invokeKey, size.height, size.width, visible]);

  if (!visible) return null;

  return (
    <div className={className} data-adsterra-slot={invokeKey}>
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      {/* Reserved box: the height is fixed before the iframe exists, so the
          creative arriving late does not shift the paragraph below it. */}
      <div
        ref={mountRef}
        className="mx-auto flex items-center justify-center overflow-hidden"
        style={{
          width: "100%",
          maxWidth: size.width,
          minHeight: failed ? 0 : size.height,
        }}
      />

      {failed ? (
        <p className="text-center text-[11px] text-slate-600">
          Advertisement unavailable
        </p>
      ) : null}
    </div>
  );
}