import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { isTranslated } from "@/i18n/translated";
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
  const { locale, path } = splitLocale(pathname);

  const bypassI18n =
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/confirm");

  const sessionResponse = SESSION_SKIP.test(path)
    ? null
    : await updateSession(request);

  if (bypassI18n) return sessionResponse ?? NextResponse.next();

  const response = handleI18n(request);

  // Carry refreshed Supabase cookies over to the final response.
  sessionResponse?.cookies
    .getAll()
    .forEach((cookie) => response.cookies.set(cookie));

  // Untranslated pages shown inside a non-default locale must not be indexed.
  if (locale !== routing.defaultLocale && !isTranslated(locale, path)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest|js|css|map|woff2?)$).*)",
  ],
};
