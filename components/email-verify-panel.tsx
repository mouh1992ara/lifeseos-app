"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2, Mail, RefreshCw } from "lucide-react";

import { CodeInput } from "@/components/code-input";
import { VerifySuccess } from "@/components/verify-success";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_S = 60;
const POLL_MS = 6000;

/** Set only when the Supabase "Confirm signup" template includes {{ .Token }}. */
const OTP_ENABLED = process.env.NEXT_PUBLIC_EMAIL_OTP_ENABLED === "1";
const OTP_LENGTH = Number(process.env.NEXT_PUBLIC_EMAIL_OTP_LENGTH ?? 6) || 6;

/**
 * Bidi isolation for the address.
 *
 * An email inside a right-to-left sentence is reordered by the Unicode bidi
 * algorithm (`a@b.co` can be rendered as `co@b.a`-looking output). `<bdi>` marks
 * it as an independent run with LTR direction, which keeps the address literal
 * in every language without hard-coding `dir` per locale.
 */
const mail = (chunks: React.ReactNode) => (
  <bdi dir="ltr" className="font-medium text-slate-300">
    {chunks}
  </bdi>
);

export default function EmailVerifyPanel({
  email: initialEmail,
  signedIn = false,
}: {
  /** Resolved server-side from the session first, then `?email=`. */
  email?: string;
  signedIn?: boolean;
}) {
  const t = useTranslations("Auth.verify");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();

  // The prop wins: it came from the session and cannot be spoofed by a URL.
  const email = initialEmail || params.get("email") || "";

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const done = useRef(false);

  /* ---------------------------------------------------------------- success */
  const succeed = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setVerified(true);
    // Let the animation land before moving; the check completes at ~900ms.
    window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1600);
  }, [router]);

  /* --------------------------------------------- poll for link confirmation */
  useEffect(() => {
    if (OTP_ENABLED || !email || verified) return;

    let cancelled = false;

    const check = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled || !data.user) return;

        const sameAddress = data.user.email?.toLowerCase() === email.toLowerCase();
        const confirmed = Boolean(data.user.email_confirmed_at ?? data.user.confirmed_at);

        // Only a backend-confirmed address and an identical email count.
        if (sameAddress && confirmed) succeed();
      } catch {
        /* Offline: keep quietly polling, the resend button still works. */
      }
    };

    void check();
    const interval = window.setInterval(check, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [email, verified, succeed]);

  /* -------------------------------------------------------------- cooldown */
  useEffect(() => {
    if (cooldown <= 0) return;

    timer.current = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  /* ---------------------------------------------------------------- resend */
  const resend = async () => {
    if (!email || resending || cooldown > 0) return;

    setResending(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (res.status === 429) {
        setError(t("errorRate"));
        return;
      }
      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }

      setNotice(t("resent"));
      setCooldown(COOLDOWN_S);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setResending(false);
    }
  };

  /* ------------------------------------------------------------------ code */
  const submitCode = async (value: string) => {
    if (value.length !== OTP_LENGTH || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, token: value }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok) {
        succeed();
        return;
      }

      setCode("");
      if (data.error === "expired_code") setError(t("errorExpired"));
      else if (data.error === "rate_limited") setError(t("errorRate"));
      else setError(t("errorInvalid"));
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------------------- success */
  if (verified) {
    return (
      <VerifySuccess
        title={t("successTitle")}
        body={t("successBody")}
        footnote={t("successFootnote")}
      />
    );
  }

  /* ------------------------------------------------------------ no address */
  if (!email) {
    /* Two very different situations, and telling them apart matters: a
       signed-in session with nothing to verify is fine (their address is
       already confirmed), while an anonymous visitor genuinely has no pending
       registration. Only the second should suggest signing up again. */
    return (
      <div className="mt-2">
        {signedIn ? (
          <p className="mt-1.5 text-sm leading-6 text-slate-400">{t("nothingPending")}</p>
        ) : (
          <p className="mt-1.5 text-sm leading-6 text-slate-400">{t("noEmail")}</p>
        )}

        <div className="mt-6 grid gap-2.5">
          <Link href="/dashboard" className="btn-primary h-11 w-full text-sm">
            {t("goToDashboard")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>

          {signedIn ? null : (
            <Link href="/auth/sign-up" className="btn-secondary h-11 w-full text-sm">
              {t("backToSignUp")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------- otp or link view */
  return (
    <div className="mt-2" data-verify-mode={OTP_ENABLED ? "otp" : "link"}>
      {OTP_ENABLED ? (
        <>
          <p className="mt-1.5 text-sm leading-6 text-slate-400">
            {t.rich("otpBody", { email, mail })}
          </p>

          <div className="mt-7">
            <CodeInput
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              length={OTP_LENGTH}
              disabled={submitting}
              invalid={Boolean(error)}
              label={t("codeLabel")}
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={() => void submitCode(code)}
            disabled={submitting || code.length !== OTP_LENGTH}
            className="btn-primary mt-5 h-11 w-full text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t("verifying")}
              </>
            ) : (
              t("verify")
            )}
          </button>
        </>
      ) : (
        <>
          <div className="mail-illo" aria-hidden="true">
            <span className="mail-illo-glow" />
            <div className="mail-illo-body">
              <span className="mail-illo-flap" />
              <span className="mail-illo-dot" />
            </div>
          </div>

          <h2 className="mt-6 text-center text-[17px] font-semibold text-white">
            {t("checkInbox")}
          </h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-400">
            {t.rich("sentTo", { email, mail })}
          </p>
        </>
      )}

      {notice ? (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-emerald-300" role="status">
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-red-300" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void resend()}
        disabled={resending || cooldown > 0}
        className="btn-secondary mt-5 h-11 w-full text-sm"
      >
        {resending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("resending")}
          </>
        ) : cooldown > 0 ? (
          <>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("resendIn", { seconds: cooldown })}
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("resend")}
          </>
        )}
      </button>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-600">{t("spam")}</p>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-500">
        <span>{t("wrongEmail")}</span>
        <Link
          href="/auth/sign-up"
          className="font-medium text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
        >
          {t("changeEmail")}
        </Link>
      </div>
    </div>
  );
}
