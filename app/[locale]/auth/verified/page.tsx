import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AuthShell from "@/components/auth-shell";
import VerifiedPanel from "@/components/verified-panel";
import { createClient } from "@/lib/supabase/server";
import { consumeHandoff, HANDOFF_COOKIE } from "@/lib/verify-handoff";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

/**
 * Success screen — reachable only for a confirmation that just happened.
 *
 * Gates, all server-side:
 *
 *   1. no session             → the link was incomplete or already consumed; show
 *                               the link-failure page, never an animation;
 *   2. session, unconfirmed   → back to the verification screen;
 *   3. no valid handoff ticket → they typed the URL, used a bookmark, or replayed
 *                               an old cookie. They are signed in and fine, so
 *                               send them to the dashboard — but do not claim a
 *                               fresh verification.
 *
 * The ticket is minted by `/auth/callback` immediately after Supabase confirms
 * the address, is HMAC-signed, bound to the user id, and lives two minutes. It is
 * cleared below before the page renders, so a refresh cannot replay it.
 *
 * This replaces the previous 15-minute freshness window, which a bookmark inside
 * that window could satisfy. A window is a guess about intent; a single-use ticket
 * is evidence of it.
 */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/error?error=missing_token`);
  }

  const confirmed = Boolean(user.email_confirmed_at ?? user.confirmed_at);
  if (!confirmed) {
    redirect(`/${locale}/auth/verify`);
  }

  const jar = await cookies();
  const ticket = jar.get(HANDOFF_COOKIE)?.value;

  /* Atomic spend. A signature alone would let two concurrent requests both pass,
     and a copied cookie would work again inside the window — so the decision is
     made by a server-side `SET NX`, not by the cookie. Only `consumed` renders
     the animation; `replayed` and `invalid` go to the dashboard.

     `unverifiable` means Redis is not configured. Displaying the animation then
     would mean claiming "confirmed just now" on evidence we cannot verify, so we
     do not: the user is already signed in and lands on the dashboard instead. */
  const spent = await consumeHandoff(ticket, user.id);

  if (spent.status !== "consumed") {
    redirect(`/${locale}/dashboard`);
  }

  /* The cookie itself is cleared in `proxy.ts`, which can write response cookies;
     a server component cannot. That clear is belt-and-braces on top of the
     atomic spend above, not the mechanism that makes this one-time. */
  const t = await getTranslations("Auth.verified");

  return (
    <AuthShell heading={t("heading")}>
      <Suspense fallback={<div className="mt-7 h-64" aria-hidden="true" />}>
        <VerifiedPanel />
      </Suspense>
    </AuthShell>
  );
}

export const metadata = { robots: { index: false, follow: false } };