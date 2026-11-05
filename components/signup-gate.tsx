"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * First-visit invitation, shown to anonymous visitors only.
 *
 * Deliberately conservative, because an aggressive modal is the fastest way to
 * make a free tool feel gated:
 *
 *   - never on load: waits for a delay AND a meaningful signal (scroll depth or
 *     a tool interaction), whichever happens first;
 *   - never on auth, dashboard or legal routes;
 *   - never for a signed-in user (checked against Supabase, not a client flag);
 *   - dismissed for good after two refusals, and for 14 days after one;
 *   - never traps focus or blocks Escape, and the tools keep working behind it.
 */

const STORAGE_KEY = "ls.gate";
const DELAY_MS = 22000;
const SCROLL_SIGNAL = 0.45;
const MAX_DISMISSALS = 2;
const SNOOZE_DAYS = 14;

/** Routes where a sign-up prompt is intrusive or pointless. */
const EXCLUDED = ["/auth", "/dashboard", "/protected", "/admin", "/privacy", "/terms"];

type GateState = { count: number; until: number };

function readState(): GateState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, until: 0 };
    const parsed = JSON.parse(raw) as Partial<GateState>;
    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      until: typeof parsed.until === "number" ? parsed.until : 0,
    };
  } catch {
    // Corrupt or blocked storage must not crash the page; treat as dismissed
    // long enough that the visitor is not nagged.
    return { count: MAX_DISMISSALS, until: Date.now() + SNOOZE_DAYS * 864e5 };
  }
}

function writeState(next: GateState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — the modal still closes for this page view */
  }
}

export default function SignupGate() {
  const t = useTranslations("Auth.gate");
  const pathname = usePathname() ?? "/";

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [ready, setReady] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fired = useRef(false);

  const excluded = EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  /* Decide whether this visitor is eligible at all. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (excluded) return;
      if (document.documentElement.hasAttribute("data-authed")) return;

      const state = readState();
      if (state.count >= MAX_DISMISSALS) return;
      if (Date.now() < state.until) return;

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        // Signed in: never show. Bail before arming any trigger.
        if (data.user) return;
      } catch {
        if (cancelled) return;
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [excluded]);

  const show = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setOpen(true);
  }, []);

  /* Triggers: scroll depth, or a click inside a tool surface, or the delay. */
  useEffect(() => {
    if (!ready) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= SCROLL_SIGNAL) show();
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // A genuine tool interaction (running an analysis, opening a result).
      if (target?.closest("[data-tool-surface]")) show();
    };

    const timer = window.setTimeout(show, DELAY_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, [ready, show]);

  /* Escape closes; body scroll is locked only while the dialog is mounted. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button, not the primary CTA: a visitor who is not
    // interested should be able to leave with one keypress.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
    // `dismiss` closes over refs and setState only; re-running this effect on
    // every render would steal focus from the dialog.
  }, [open]);

  /* Focus trap: keep Tab inside the dialog. */
  const onKeyDownTrap = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const nodes = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const dismiss = () => {
    const state = readState();
    const count = state.count + 1;
    writeState({
      count,
      // After the first refusal, stay away for two weeks. After the second,
      // the counter alone keeps it closed.
      until: count >= MAX_DISMISSALS ? 0 : Date.now() + SNOOZE_DAYS * 864e5,
    });

    setClosing(true);
    // Let the exit transition play before unmounting.
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  if (!open) return null;

  return (
    <div
      className={`gate-backdrop fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center ${closing ? "is-closing" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        aria-describedby="gate-body"
        onKeyDown={onKeyDownTrap}
        data-signup-gate=""
        className="gate-dialog relative w-full max-w-md overflow-hidden rounded-[26px] border border-white/10 bg-slate-950 p-6 shadow-[0_50px_120px_-50px_rgba(0,0,0,1)] sm:p-8"
      >
        <span aria-hidden="true" className="gate-glow" />

        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={t("close")}
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.07] hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10">
            <Sparkles className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          </span>

          <h2 id="gate-title" className="mt-5 text-balance text-xl font-bold text-white">
            {t("title")}
          </h2>

          <p id="gate-body" className="mt-2.5 text-[13px] leading-6 text-slate-400">
            {t("body")}
          </p>

          <ul className="mt-5 space-y-2">
            {["one", "two", "three"].map((k) => (
              <li key={k} className="flex items-start gap-2 text-[12.5px] leading-6 text-slate-300">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                {t(`perks.${k}`)}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-2.5">
            <Link href="/auth/sign-up" onClick={dismiss} className="btn-primary h-11 text-sm">
              {t("create")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>

            <Link href="/auth/login" onClick={dismiss} className="btn-secondary h-11 text-sm">
              {t("signIn")}
            </Link>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="mt-3 w-full py-1.5 text-center text-[12px] font-medium text-slate-500 transition hover:text-slate-300"
          >
            {t("later")}
          </button>
        </div>
      </div>
    </div>
  );
}