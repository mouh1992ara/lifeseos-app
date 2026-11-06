import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import AuthShell from "@/components/auth-shell";
import EmailVerifyPanel from "@/components/email-verify-panel";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
};

export const dynamic = "force-dynamic";

/**
 * Verification screen.
 *
 * The address is resolved on the server, in this order:
 *
 *   1. an already-confirmed session → the user does not need this page at all,
 *      so they are sent to the dashboard instead of being shown a stale link to
 *      click a second time;
 *   2. a signed-in but unconfirmed session → its own email, no query string
 *      required. Mail clients strip query parameters, and a phone that signed in
 *      from another tab never had one to begin with;
 *   3. an anonymous visitor → `?email=` if present, otherwise an honest
 *      "nothing pending here" state.
 *
 * Previously the panel read only `?email=`, so a signed-in user who opened this
 * route directly was told to "create your account again" — untrue and alarming.
 */
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  const { email: queryEmail } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const confirmed = Boolean(user?.email_confirmed_at ?? user?.confirmed_at);

  if (user && confirmed) {
    // Nothing to verify. Sending them to the dashboard is the truthful answer;
    // showing the success animation here would imply a fresh confirmation.
    redirect(`/${locale}/dashboard`);
  }

  const email = user?.email ?? queryEmail ?? "";
  const t = await getTranslations("Auth.verify");

  return (
    <AuthShell heading={t("title")}>
      <Suspense fallback={<div className="mt-7 h-64" aria-hidden="true" />}>
        <EmailVerifyPanel email={email} signedIn={Boolean(user)} />
      </Suspense>
    </AuthShell>
  );
}

export const metadata = { robots: { index: false, follow: false } };