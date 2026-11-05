"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth.forgot");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    try {
      /* The redirect target must be a route already allow-listed in Supabase's
         redirect URLs. Pointing at the callback lets the PKCE code be exchanged
         for a recovery session, which is what /auth/update-password needs. */
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message.toLowerCase() : "";
      setError(
        m.includes("rate") || m.includes("too many")
          ? t("rateLimited")
          : err instanceof Error
            ? err.message
            : t("errorFallback"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={className}>
        <p className="mt-1.5 text-sm leading-6 text-slate-400">{t("successDescription")}</p>

        <div className="mt-7 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.08] px-4 py-3.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium text-emerald-200">{t("successTitle")}</p>
            <p className="mt-1 text-[12px] leading-6 text-slate-400">{t("successBody")}</p>
          </div>
        </div>

        <p
          className="mt-4 rounded-lg border border-white/[0.07] bg-slate-900/50 px-3 py-2 text-[12px] text-slate-400"
          dir="ltr"
        >
          {email}
        </p>

        <Link href="/auth/login" className="btn-secondary mt-6 h-11 w-full text-sm">
          {t("loginLink")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mt-1.5 text-sm leading-6 text-slate-400">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
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

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.08] px-3 py-2.5 text-[13px] leading-6 text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
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
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("submit")}
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-slate-400">
        {t("haveAccount")}{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline"
        >
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}