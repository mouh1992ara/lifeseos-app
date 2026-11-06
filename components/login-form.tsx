"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import PasswordField from "@/components/password-field";
import { Link } from "@/i18n/navigation";
import { REMEMBER_KEY } from "@/components/session-policy";
import { createClient } from "@/lib/supabase/client";
import { safePath } from "@/lib/safe-redirect";

/** Supabase's messages are developer-facing; map the ones users hit. */
function readableError(message: string, fallback: string, t: (k: string) => string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return t("invalidCredentials");
  if (m.includes("email not confirmed")) return t("emailNotConfirmed");
  if (m.includes("rate limit") || m.includes("too many")) return t("tooMany");
  if (m.includes("fetch") || m.includes("network")) return t("network");
  return fallback || t("errorFallback");
}

export function LoginForm({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth.login");
  const tc = useTranslations("Auth.common");
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = params.get("next");

  /* The session itself always lives in a Supabase cookie. "Keep me signed in"
     chooses between a long-lived cookie (default) and a browser-session one, so
     the preference is read back from the same markers SessionPolicy uses. */
  useEffect(() => {
    try {
      setRemember(window.localStorage.getItem(REMEMBER_KEY) !== "0");
    } catch {
      /* storage blocked — default stays checked */
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    setIsLoading(true);
    setError(null);
    setUnconfirmed(false);

    try {
      try {
        // Only the preference is stored here; SessionPolicy acts on it by
        // rewriting the Supabase cookie's lifetime on the next page load.
        window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
      } catch {
        /* storage blocked — the login itself must still work */
      }

      const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      /* A password is not proof of mailbox ownership, and Supabase is only
         configured to block unconfirmed accounts — which is a project setting,
         not a guarantee. Treat the confirmed flag as authoritative here too:
         an unverified session is discarded rather than handed a dashboard. */
      const confirmed = Boolean(
        signIn.user?.email_confirmed_at ?? signIn.user?.confirmed_at,
      );

      if (!confirmed) {
        await supabase.auth.signOut();
        setUnconfirmed(true);
        router.push(`/auth/verify?email=${encodeURIComponent(email)}&reason=unverified`);
        return;
      }

      router.push(safePath(nextPath, "/dashboard"));
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("email not confirmed")) setUnconfirmed(true);
      setError(readableError(message, t("errorFallback"), t));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <p className="mt-1.5 text-sm text-slate-400">{t("description")}</p>

      <form onSubmit={handleLogin} className="mt-7 grid gap-5" noValidate>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-[13px] font-medium text-slate-300">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="field text-start"
          />
        </div>

        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
        >
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-slate-900 accent-emerald-400"
              />
              {t("remember")}
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-[12px] font-medium text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
            >
              {t("forgot")}
            </Link>
          </div>
        </PasswordField>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.08] px-3 py-2.5 text-[13px] leading-6 text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {error}
              {unconfirmed ? (
                <>
                  {" "}
                  <Link
                    href={`/auth/verify?email=${encodeURIComponent(email)}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    {tc("verifyNow")}
                  </Link>
                </>
              ) : null}
            </span>
          </div>
        ) : null}

        <button type="submit" disabled={isLoading} className="btn-primary h-11 w-full text-sm">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("submitting")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-slate-400">
        {t("noAccount")}{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </div>
  );
}