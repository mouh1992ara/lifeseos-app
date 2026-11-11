import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/config";
import { resolveLegacy } from "@/lib/legacy-redirects";
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

  /* The locale actually written in the URL, if any. `splitLocale` falls back to
     the default locale, which is right for rendering and wrong for redirects:
     `/keyword-density-checker` has no prefix while `/fr/keyword-density-checker`
     does, and the legacy resolver needs to tell them apart. */
  const firstSegment = pathname.split("/")[1] ?? "";
  const pathLocale = localeSet.has(firstSegment) ? firstSegment : null;

  /* ---------------------------------------------------------------- legacy --
   * Old WordPress URLs are still in search results and backlinks. Resolve them
   * before the i18n middleware runs, because that middleware would otherwise
   * treat `/es/...` as a path to prefix and produce either a 404 or a redirect
   * to the homepage — both of which strand the visitor and tell Google nothing
   * useful. See lib/legacy-redirects.ts for why each URL gets the answer it
   * gets.
   */
  const legacy = resolveLegacy(path, pathLocale);

  if (legacy?.kind === "redirect") {
    const target = request.nextUrl.clone();
    target.pathname = legacy.to;
    target.search = "";
    return NextResponse.redirect(target, 301);
  }

  if (legacy?.kind === "gone") {
    /* 410 rather than a redirect to `/`: a redirect would be a soft 404 that
       keeps the old URL alive in the index, and Google would re-crawl it
       indefinitely. The body is deliberately small — this is a dead end, and it
       should look like one. */
    return new NextResponse(
      `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gone — LifeSeos</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#020617;color:#e2e8f0;font:16px/1.6 system-ui,sans-serif">
<main style="max-width:32rem;padding:2rem;text-align:center">
<h1 style="font-size:1.5rem;margin:0 0 .75rem">This page no longer exists</h1>
<p style="color:#94a3b8;margin:0 0 1.5rem">The tool or page at this address has been removed and has no replacement.</p>
<p style="margin:0"><a href="/tools" style="color:#34d399">Browse the current tools</a></p>
</main></body></html>`,
      { status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } },
    );
  }

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
    /* Send each payload to the handler that can actually consume it. A
       `token_hash` forwarded to `/auth/callback` is useless: that route exchanges
       a PKCE `?code=` and has no verifier to offer, so the rescue path would turn
       a recoverable fallback into a guaranteed failure — which matters because a
       Site-URL substitution lands these params on `/`. */
    target.pathname = request.nextUrl.searchParams.has("token_hash")
      ? "/auth/confirm"
      : "/auth/callback";
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
