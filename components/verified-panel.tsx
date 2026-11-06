"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { VerifySuccess } from "@/components/verify-success";

/**
 * Landing after the confirmation link has been exchanged for a session.
 *
 * Rendered only when the server component above has already read a confirmed
 * `email_confirmed_at`; this component never decides that itself.
 */
export default function VerifiedPanel() {
  const t = useTranslations("Auth.verified");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();

  const raw = params.get("next");
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : `/${locale}/dashboard`;

  useEffect(() => {
    // Long enough for the checkmark to draw, short enough not to feel stuck.
    const timer = window.setTimeout(() => {
      router.push(next);
      router.refresh();
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [next, router]);

  return (
    <div>
      <VerifySuccess title={t("title")} body={t("body")} footnote={t("footnote")} />

      {/* Plain navigation, not the i18n Link: `next` is already locale-qualified. */}
      <button
        type="button"
        onClick={() => {
          router.push(next);
          router.refresh();
        }}
        className="btn-primary mt-7 h-11 w-full text-sm"
      >
        {t("continue")}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
    </div>
  );
}
