"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * Cloudflare Turnstile.
 *
 * Rendered explicitly (not implicitly) so we control when it mounts and can
 * read the token. The widget is a signal only — the sign-up route calls
 * siteverify with the secret, and a bot that skips the widget is rejected there,
 * not here.
 *
 * With no `NEXT_PUBLIC_TURNSTILE_SITE_KEY` the component renders nothing and
 * reports a null token; the server then relies on its per-IP budget. That state
 * is reported as "not configured", never as "protected".
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function Turnstile({
  onToken,
  resetSignal = 0,
}: {
  onToken: (token: string | null) => void;
  /** Bump to force a fresh challenge after a failed submission. */
  resetSignal?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !ready || !host.current || !window.turnstile) return;

    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    }

    widgetId.current = window.turnstile.render(host.current, {
      sitekey: SITE_KEY,
      theme: "dark",
      size: "flexible",
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
      "timeout-callback": () => onToken(null),
    });

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [ready, onToken, resetSignal]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={host} className="turnstile-host" data-testid="turnstile" />
    </>
  );
}

export const turnstileEnabled = Boolean(SITE_KEY);
