import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/language-switcher";
import Logo from "@/components/logo";
import { HeaderRail } from "@/components/glass/header-rail";
import { NavLink } from "@/components/nav-link";
import { localizePath, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth-guard";

/* One set of classes per role, so the header cannot drift from the rest of the
   site as pages are added. Sizes are identical between desktop and mobile:
   only padding changes.

   The mobile links are 12px text, so their natural box is ~18-22px tall. The
   padding below grows the touch target to 44px (WCAG 2.5.5); the matching
   negative vertical margin keeps the visual line box exactly where it was, so
   spacing in the mobile bar does not change. */
const mobileCta =
  "rounded-lg bg-emerald-400 px-3 py-1.5 text-[12px] font-semibold text-slate-950 transition hover:bg-emerald-300";
const deskLink =
  "nav-link rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white";
const deskPlain =
  "rounded-lg px-3.5 py-2 text-sm text-slate-300 transition hover:text-white";
const deskOutline =
  "rounded-lg border border-white/15 px-3.5 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white";
const deskCta =
  "rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-px hover:bg-emerald-300 hover:shadow-[0_10px_30px_-12px_rgba(52,211,153,.8)]";

export default function SiteHeader() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <SiteHeaderContent />
    </Suspense>
  );
}

async function SiteHeaderContent() {
  const user = await getCurrentUser();

  const t = await getTranslations("Header");
  const locale = (await getLocale()) as Locale;

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(localizePath(locale, "/"));
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0];

  return (
    <header className="site-header">
      {/* ================= MOBILE ================= */}
      <div className="flex flex-col items-center gap-2.5 px-4 py-3 md:hidden">
        <div className="flex w-full items-center justify-between">
          <Logo compact />

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />

            {user ? (
              <form action={logout}>
                <button type="submit" className={deskOutline}>
                  {t("signOut")}
                </button>
              </form>
            ) : (
              <Link href="/auth/sign-up" className={mobileCta}>
                {t("getStarted")}
              </Link>
            )}
          </div>
        </div>

        {/* One glass rail instead of four separately-hovered links: the sliding
            indicator is what tells you where you are on a small screen, where
            underline states are easy to miss. */}
        <div className="w-full" aria-label={t("mobileNav")}>
          <HeaderRail
            size="sm"
            variant="sheet"
            className="w-full justify-between"
            labels={{ tools: t("tools"), solutions: t("solutions"), blog: t("blog") }}
            account={
              user
                ? { href: "/dashboard", label: t("dashboard") }
                : { href: "/auth/login", label: t("signIn") }
            }
          />
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="mx-auto hidden w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 md:flex">
        <Logo />

        <div className="flex items-center gap-2.5">
          <HeaderRail labels={{ tools: t("tools"), solutions: t("solutions"), blog: t("blog") }} />

          <span aria-hidden="true" className="h-5 w-px bg-white/10" />

          {user ? (
            <>
              <span className="max-w-[10rem] truncate px-2 text-sm text-slate-400">
                {displayName}
              </span>

              <NavLink href="/dashboard" className={deskLink}>
                {t("dashboard")}
              </NavLink>

              <LanguageSwitcher />

              <form action={logout}>
                <button type="submit" className={deskOutline}>
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <LanguageSwitcher />

              <Link href="/auth/login" className={deskPlain}>
                {t("signIn")}
              </Link>

              <Link href="/auth/sign-up" className={deskCta}>
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderFallback() {
  return (
    <header className="site-header">
      <div className="px-6 py-4">
        <Logo />
      </div>
    </header>
  );
}