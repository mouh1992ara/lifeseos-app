"use client";

import { useEffect } from "react";

/** localStorage key holding the visitor's "keep me signed in" choice. */
export const REMEMBER_KEY = "ls.remember";

/**
 * Honours "Keep me signed in" without touching the backend.
 *
 * Supabase writes its session cookie with a 400-day `max-age`. When a visitor
 * unticks remember-me we cannot ask the library to change that, but we can
 * normalise the cookie ourselves on every page load: rewriting an `sb-*`
 * cookie without `max-age`/`expires` turns it into a browser-session cookie,
 * which the browser discards when it closes.
 *
 * Running on every load also covers token refreshes, which would otherwise
 * re-introduce the 400-day expiry behind the visitor's back.
 */
export default function SessionPolicy() {
  useEffect(() => {
    let remember: string | null = null;
    try {
      remember = window.localStorage.getItem(REMEMBER_KEY);
    } catch {
      return;
    }

    // Default is "remembered": only an explicit "0" downgrades the cookie.
    if (remember !== "0") return;

    const names = document.cookie
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter((n) => n.startsWith("sb-") && n.includes("auth-token"));

    for (const name of names) {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
      );
      if (!match) continue;

      // Re-set without an expiry: same value, session-scoped lifetime.
      document.cookie = `${name}=${match[1]}; path=/; samesite=lax`;
    }
  }, []);

  return null;
}