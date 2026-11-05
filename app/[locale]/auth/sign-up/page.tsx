import { getTranslations, setRequestLocale } from "next-intl/server";

import AuthShell from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth.signUp");

  return (
    <AuthShell heading={t("title")}>
      <SignUpForm />
    </AuthShell>
  );
}