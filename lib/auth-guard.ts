import { cache } from "react";
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

/**
 * The signed-in user, read at most once per request.
 *
 * `supabase.auth.getUser()` is a network round-trip to /auth/v1/user, not a
 * local cookie read. Both the locale layout and the site header need the answer,
 * and before this helper they each called it — two sequential round-trips on
 * every page render, for every visitor, including anonymous ones.
 *
 * React's `cache()` scopes the result to a single render pass, so the second
 * caller reuses the first call's promise. Behaviour is identical: same user,
 * same guards, just one request instead of two.
 *
 * Anonymous visitors still pay one call, because only Supabase can tell us
 * whether a cookie is a live session. Skipping on "no cookie" would be wrong for
 * users whose session lives in a different cookie shape.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
});

function isConfirmed(user: User): user is VerifiedUser {
  // Supabase sets `confirmed_at` on older projects and `email_confirmed_at` on
  // newer ones; accept either, never a missing value.
  return Boolean(user.email_confirmed_at ?? user.confirmed_at);
}

/** For server components: redirects instead of returning null. */
export async function requireVerifiedUser(nextPath = "/dashboard"): Promise<VerifiedUser> {
  const user = await getCurrentUser();

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
  const user = await getCurrentUser();

  if (!user || !isConfirmed(user)) return null;
  return user;
}
