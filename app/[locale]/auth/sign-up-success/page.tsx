import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthShell from "@/components/auth-shell";
import EmailVerifyPanel from "@/components/email-verify-panel";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
};

/**
 * Kept for links already in the wild (`/auth/sign-up-success`). It renders the
 * same live verification panel as `/auth/verify`, so there is exactly one
 * verification experience to maintain.
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.verify");

  return (
    <AuthShell heading={t("title")}>
      <Suspense fallback={<div className="mt-7 h-64" aria-hidden="true" />}>
        <EmailVerifyPanel />
      </Suspense>
    </AuthShell>
  );
}