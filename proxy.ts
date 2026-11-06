import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18n = createMiddleware(routing);
const localeSet = new Set<string>(routing.locales);

// Same exemptions the old matcher had: these paths never refreshed the Supabase session.
const SESSION_SKIP =
  /^\/(?:tools|api\/http-status|api\/seo-page-analyzer)(?:\/|$)/;

function splitLocale(pathname: string) {
  const seg = pathname.split("/")[1];
  if (seg && localeSet.has(seg)) {
    return { locale: seg, path: pathname.slice(seg.length + 1) || "/" };
  }
  return { locale: routing.defaultLocale as string, path: pathname };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { path } = splitLocale(pathname);

  /* ---------------------------------------------------------------- rescue --
   * When `emailRedirectTo` is not in Supabase's Redirect URL allow-list the
   * provider silently falls back to **Site URL**, so a confirmation link can
   * land on "/" with `?code=…` and the page simply renders the homepage — the
   * confirmation appears to vanish. Any auth payload arriving on a non-auth
   * path is forwarded to the handler that knows what to do with it.
   *
   * This does not replace fixing the allow-list; it makes a wrong Site URL
   * degrade into a real attempt instead of a dead end.
   */
  const hasAuthPayload =
    request.method === "GET" &&
    (request.nextUrl.searchParams.has("code") ||
      request.nextUrl.searchParams.has("token_hash"));

  if (hasAuthPayload && !pathname.startsWith("/auth/") && !pathname.startsWith("/api/")) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth/callback";
    return NextResponse.redirect(target);
  }

  /* Top-level auth routes are locale-less. Handing them to the i18n middleware
     rewrites them to `/en/auth/callback`, which does not exist — that is a 404 on
     every confirmation, not a redirect bug. `/auth/confirm` was already excluded
     here; `/auth/callback` was not, so it never resolved. */
  const bypassI18n =
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/confirm");

  const sessionResponse = SESSION_SKIP.test(path)
    ? null
    : await updateSession(request);

  if (bypassI18n) return sessionResponse ?? NextResponse.next();

  const response = handleI18n(request);

  /* Burn the single-use verification ticket once the success page has served it.
     A server component cannot write cookies, so the delete happens here: the
     ticket was already validated against this request, and clearing it means a
     refresh or a shared link cannot replay the animation. */
  if (path.endsWith("/auth/verified") && request.cookies.has("ls.verify")) {
    response.cookies.set("ls.verify", "", { path: "/", maxAge: 0 });
  }

  // Carry refreshed Supabase cookies over to the final response.
  sessionResponse?.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  // Every locale route is fully translated now, so nothing needs noindex.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest|js|css|map|woff2?)$).*)",
  ],
};
