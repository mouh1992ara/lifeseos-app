import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/language-switcher";
import Logo from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { SolutionsMenu } from "@/components/solutions-menu";
import { localizePath, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

/* One set of classes per role, so the header cannot drift from the rest of the
   site as pages are added. Sizes are identical between desktop and mobile:
   only padding changes. */
const mobileLink = "text-[12px] font-medium text-slate-300 transition hover:text-white";
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
const solutionsMobile =
  "inline-flex items-center gap-1 text-[12px] font-medium text-slate-300 hover:text-white";
const solutionsDesk =
  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white aria-expanded:bg-white/[0.08] aria-expanded:text-white";

export default function SiteHeader() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <SiteHeaderContent />
    </Suspense>
  );
}

async function SiteHeaderContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

        <nav
          aria-label={t("mobileNav")}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"
        >
          <NavLink href="/tools" className={mobileLink}>
            {t("tools")}
          </NavLink>

          <SolutionsMenu variant="sheet" className={solutionsMobile} />

          <NavLink href="/blog" className={mobileLink}>
            {t("blog")}
          </NavLink>

          {user ? (
            <NavLink href="/dashboard" className={mobileLink}>
              {t("dashboard")}
            </NavLink>
          ) : (
            <NavLink href="/auth/login" className={mobileLink}>
              {t("signIn")}
            </NavLink>
          )}
        </nav>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="mx-auto hidden w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 md:flex">
        <Logo />

        <nav aria-label={t("primaryNav")} className="flex items-center gap-1.5">
          <NavLink href="/tools" className={deskLink}>
            {t("tools")}
          </NavLink>

          <SolutionsMenu label={t("solutions")} className={solutionsDesk} />

          <NavLink href="/blog" className={deskLink}>
            {t("blog")}
          </NavLink>

          <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-white/10" />

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
        </nav>
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