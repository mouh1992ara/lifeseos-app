"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import PasswordField from "@/components/password-field";
import { scorePassword } from "@/components/sign-up-form";
import { createClient } from "@/lib/supabase/client";

const STRENGTH_COLOR = ["#f87171", "#f87171", "#fbbf24", "#34d399", "#34d399"];

export function UpdatePasswordForm({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth.update");
  const tc = useTranslations("Auth.common");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const mismatch = repeat.length > 0 && repeat !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError(t("tooShort"));
      return;
    }
    if (password !== repeat) {
      setError(t("mismatch"));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // The recovery link already established a session; the dashboard is the
      // first place the new password is actually exercised.
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message.toLowerCase() : "";
      setError(
        m.includes("session") || m.includes("auth")
          ? t("sessionExpired")
          : err instanceof Error
            ? err.message
            : t("errorFallback"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <p className="mt-1.5 text-sm leading-6 text-slate-400">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
        <PasswordField
          id="password"
          value={password}
          onChange={setPassword}
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
        >
          <div className="mt-1 flex items-center gap-2">
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
              className="w-14 text-end text-[11px] font-medium"
              style={{ color: password ? STRENGTH_COLOR[strength] : undefined }}
            >
              {password
                ? t(`strength.${["weak", "weak", "fair", "good", "strong"][strength]}`)
                : ""}
            </span>
          </div>
        </PasswordField>

        <PasswordField
          id="repeat"
          value={repeat}
          onChange={setRepeat}
          label={tc("confirmPassword")}
          autoComplete="new-password"
          invalid={mismatch}
        >
          {mismatch ? (
            <p className="flex items-center gap-1.5 text-[11px] text-red-300">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t("mismatch")}
            </p>
          ) : null}
        </PasswordField>

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
    </div>
  );
}