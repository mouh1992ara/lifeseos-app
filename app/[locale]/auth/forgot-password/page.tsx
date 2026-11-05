import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthShell from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.forgot");

  return (
    <AuthShell heading={t("title")}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}