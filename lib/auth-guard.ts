import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Single source of truth for "is this visitor allowed into authenticated
 * surfaces".
 *
 * The previous code checked only `if (!user)`. That is not enough: a session
 * proves you signed in, not that you own the mailbox — and the sign-up handler
 * itself redirected to /dashboard whenever Supabase returned a session, so the
 * app happily served an unconfirmed account. A session whose
 * `email_confirmed_at` is null must never reach the dashboard, an API route, or
 * a saved report.
 */

export type VerifiedUser = User & { email_confirmed_at: string };

function isConfirmed(user: User): user is VerifiedUser {
  // Supabase sets `confirmed_at` on older projects and `email_confirmed_at` on
  // newer ones; accept either, never a missing value.
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

/** For server components: redirects instead of returning null. */
export async function requireVerifiedUser(nextPath = "/dashboard"): Promise<VerifiedUser> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!isConfirmed(user)) {
    const email = user.email ?? "";
    redirect(`/auth/verify?email=${encodeURIComponent(email)}&reason=unverified`);
  }

  return user;
}

/** For route handlers: `null` instead of a redirect, so the caller can answer 401. */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isConfirmed(user)) return null;
  return user;
}
