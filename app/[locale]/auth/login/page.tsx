import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthShell from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.login");

  return (
    <AuthShell heading={t("title")}>
      {/* useSearchParams needs a boundary; the form reads `?next=` from it. */}
      <Suspense fallback={<div className="mt-7 h-64" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}