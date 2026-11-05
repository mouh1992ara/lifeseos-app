"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";

import PasswordField from "@/components/password-field";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

/** 0–4, and the reasons behind it, so the hint can be specific. */
export function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  if (value.length > 0 && value.length < 8) score = Math.min(score, 1);
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_COLOR = ["#f87171", "#f87171", "#fbbf24", "#34d399", "#34d399"];

export function SignUpForm({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth.signUp");
  const tc = useTranslations("Auth.common");
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const mismatch = repeat.length > 0 && repeat !== password;
  const strongEnough = password.length >= 8;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!strongEnough) {
      setError(t("strengthHint"));
      return;
    }
    if (password !== repeat) {
      setError(t("errorMismatch"));
      return;
    }
    if (!terms) {
      setError(t("termsRequired"));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          /* Stored on the auth user, so the dashboard can greet them by name.
             This is real metadata on the Supabase user record, not a local
             cache. */
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;

      // Two legitimate outcomes: a session (email confirmation disabled) or a
      // user with no session (confirmation required). We branch on what the
      // backend actually returned instead of assuming.
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      const m = message.toLowerCase();
      setError(
        m.includes("already registered") || m.includes("already exists")
          ? t("errorExists")
          : m.includes("rate limit") || m.includes("too many")
            ? tc("tooMany")
            : m.includes("password")
              ? t("strengthHint")
              : message || t("errorFallback"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <p className="mt-1.5 text-sm text-slate-400">{t("description")}</p>

      <form onSubmit={handleSignUp} className="mt-7 grid gap-4" noValidate>
        <div className="grid gap-2">
          <label htmlFor="fullName" className="text-[13px] font-medium text-slate-300">
            {t("fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className="field"
          />
          <p className="text-[11px] text-slate-600">{t("fullNameHint")}</p>
        </div>

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
          autoComplete="new-password"
          describedBy="password-strength"
        >
          {/* Strength meter: four segments that fill with the score, plus the
              word. Colour is not the only signal — the label says it too. */}
          <div id="password-strength" className="mt-1">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{
                      background:
                        password && strength >= step
                          ? STRENGTH_COLOR[strength]
                          : "rgb(255 255 255 / 0.09)",
                    }}
                  />
                ))}
              </div>

              <span
                className="w-16 text-end text-[11px] font-medium tabular-nums"
                style={{ color: password ? STRENGTH_COLOR[strength] : undefined }}
              >
                {password ? t(`strength.${["weak", "weak", "fair", "good", "strong"][strength]}`) : ""}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
              {t("strengthHint")}
            </p>
          </div>
        </PasswordField>

        <PasswordField
          id="repeat"
          value={repeat}
          onChange={setRepeat}
          label={t("repeatPassword")}
          autoComplete="new-password"
          invalid={mismatch}
        >
          {mismatch ? (
            <p className="flex items-center gap-1.5 text-[11px] text-red-300">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t("errorMismatch")}
            </p>
          ) : repeat ? (
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <Check className="h-3 w-3" aria-hidden="true" />
              {tc("matches")}
            </p>
          ) : null}
        </PasswordField>

        {/* Consent. Real checkbox, real links; the form is blocked without it. */}
        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-slate-400">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/20 bg-slate-900 accent-emerald-400"
          />
          <span>
            {t.rich("terms", {
              terms: (chunks) => (
                <Link href="/terms" className="font-medium text-emerald-400 underline-offset-2 hover:underline">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" className="font-medium text-emerald-400 underline-offset-2 hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.08] px-3 py-2.5 text-[13px] leading-6 text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <button type="submit" disabled={isLoading} className="btn-primary mt-1 h-11 w-full text-sm">
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