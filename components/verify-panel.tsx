"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_S = 60;

type Status = "unknown" | "pending" | "verified" | "error";

/**
 * Email verification screen.
 *
 * Everything shown here is read from Supabase, never assumed:
 *   - `getUser()` tells us whether the address is confirmed right now;
 *   - resend calls the real `auth.resend` endpoint (type=signup).
 *
 * There is no "we verified your account" state that is not backed by
 * `email_confirmed_at`. If the backend cannot be reached, the screen says so.
 */
export default function VerifyPanel() {
  const t = useTranslations("Auth.verify");
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [status, setStatus] = useState<Status>("unknown");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const check = useCallback(async () => {
    if (!email) {
      setStatus("unknown");
      return;
    }
    setChecking(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError && authError.message.toLowerCase().includes("session")) {
        // Not signed in: we cannot read a confirmation state, and we must not
        // pretend to. The visitor can still use the link in their inbox.
        setStatus("pending");
        return;
      }
      if (authError) throw authError;

      const user = data.user;
      if (!user) {
        setStatus("pending");
        return;
      }

      // A different address being signed in must not be reported as verified.
      const sameAddress =
        user.email?.toLowerCase() === email.toLowerCase();

      setStatus(sameAddress && user.email_confirmed_at ? "verified" : "pending");
    } catch {
      setStatus("error");
      setError(t("checkError"));
    } finally {
      setChecking(false);
    }
  }, [email, t]);

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    if (cooldown <= 0) return;
    tick.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (tick.current) clearInterval(tick.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      });
      if (sendError) throw sendError;

      setMessage(t("resent"));
      setCooldown(COOLDOWN_S);
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message.toLowerCase() : "";
      setError(
        m.includes("rate") || m.includes("too many")
          ? t("resendCooldown", { seconds: COOLDOWN_S })
          : t("resendError"),
      );
    } finally {
      setResending(false);
    }
  };

  const tone =
    status === "verified"
      ? { ring: "border-emerald-400/30 bg-emerald-400/10", text: "text-emerald-300", Icon: CheckCircle2 }
      : status === "error"
        ? { ring: "border-red-400/30 bg-red-400/10", text: "text-red-300", Icon: AlertCircle }
        : { ring: "border-amber-400/25 bg-amber-400/10", text: "text-amber-300", Icon: Clock };

  return (
    <div className="mt-2">
      <p className="mt-1.5 text-sm leading-6 text-slate-400">
        {email ? t("body", { email }) : t("noEmail")}
      </p>

      {/* Status card — always reflects what the backend said. */}
      <div className={`mt-6 rounded-xl border px-4 py-3.5 ${tone.ring}`} data-verify-status={status}>
        <div className="flex items-start gap-2.5">
          <tone.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {t("statusLabel")}
            </p>
            <p className={`mt-1 text-[13px] font-medium leading-6 ${tone.text}`}>
              {status === "verified"
                ? t("verified")
                : status === "error"
                  ? t("checkError")
                  : status === "pending"
                    ? t("pending")
                    : t("spam")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void check()}
            disabled={checking}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            {checking ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
            )}
            {checking ? t("checking") : t("check")}
          </button>
        </div>
      </div>

      {message ? (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-emerald-300" role="status">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-red-300" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <p className="mt-4 text-[11px] leading-relaxed text-slate-600">{t("spam")}</p>

      <div className="mt-6 grid gap-2.5">
        <button
          type="button"
          onClick={() => void resend()}
          disabled={!email || resending || cooldown > 0}
          className="btn-secondary h-11 w-full text-sm"
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("resending")}
            </>
          ) : cooldown > 0 ? (
            <>
              <Clock className="h-4 w-4" aria-hidden="true" />
              {t("resendCooldown", { seconds: cooldown })}
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("resend")}
            </>
          )}
        </button>

        <Link href="/auth/login" className="btn-primary h-11 w-full text-sm">
          {t("signIn")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>

        <Link
          href="/"
          className="mt-1 text-center text-[12px] font-medium text-slate-500 transition hover:text-slate-300"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}