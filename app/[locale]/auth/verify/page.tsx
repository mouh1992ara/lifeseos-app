import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthShell from "@/components/auth-shell";
import VerifyPanel from "@/components/verify-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.verify");

  return (
    <AuthShell heading={t("title")}>
      <Suspense fallback={<div className="mt-7 h-64" aria-hidden="true" />}>
        <VerifyPanel />
      </Suspense>
    </AuthShell>
  );
}