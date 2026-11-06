import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, ArrowRight } from "lucide-react";

import AuthShell from "@/components/auth-shell";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

/**
 * Failure state for confirmation links.
 *
 * Supabase reports three practically distinct cases — expired, already used /
 * invalid, and a malformed link — and each needs different advice. The raw
 * provider string is never rendered: it is developer-facing, and printing it
 * leaks internals to anyone who edits the query string.
 */
function classify(raw: string) {
  const value = raw.toLowerCase();
  if (value.includes("pkce") || value.includes("code verifier") || value.includes("cross")) {
    return "crossDevice" as const;
  }
  if (value.includes("expired")) return "expired" as const;
  if (value.includes("missing") || value.includes("no token")) return "missing" as const;
  if (value.includes("invalid") || value.includes("otp") || value.includes("token")) {
    return "invalid" as const;
  }
  return "fallback" as const;
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.error");
  const kind = classify(error ?? "");

  return (
    <AuthShell heading={t("title")}>
      <div className="mt-2">
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10">
            <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />
          </span>
          <p className="text-[13px] leading-6 text-amber-100/90">{t(kind)}</p>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-slate-500">{t("hint")}</p>

        {/* Entering the address again is the only way to obtain a fresh link:
            the failure page has no trustworthy knowledge of the address. */}
        <div className="mt-6 grid gap-2.5">
          <Link href="/auth/sign-up" className="btn-primary h-11 w-full text-sm">
            {t("backToSignUp")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>

          <Link href="/auth/login" className="btn-secondary h-11 w-full text-sm">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
