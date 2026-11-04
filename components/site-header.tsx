import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/language-switcher";
import Logo from "@/components/logo";
import { SolutionsMenu } from "@/components/solutions-menu";
import { localizePath, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

const mobileLink = "text-xs text-slate-300 hover:text-white";
const mobileCta =
  "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white";
const deskLink =
  "rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white";
const deskPlain =
  "rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:text-white";
const deskOutline =
  "rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10";
const deskCta =
  "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition";
const solutionsMobile =
  "inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white";
const solutionsDesk =
  "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white";

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
    <header className="border-b border-white/10 bg-slate-950">
      {/* ================= MOBILE ================= */}
      <div className="flex flex-col items-center gap-3 px-4 py-4 md:hidden">
        <Logo />

        <nav
          aria-label={t("mobileNav")}
          className="relative flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        >
          <Link href="/tools" className={mobileLink}>
            {t("tools")}
          </Link>
          <SolutionsMenu variant="sheet" className={solutionsMobile} />
          <Link href="/blog" className={mobileLink}>
            {t("blog")}
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className={mobileLink}>
                {t("dashboard")}
              </Link>
              <LanguageSwitcher compact />
              <form action={logout}>
                <button type="submit" className={mobileCta}>
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <LanguageSwitcher compact />
              <Link href="/auth/login" className={mobileLink}>
                {t("signIn")}
              </Link>
              <Link href="/auth/sign-up" className={mobileCta}>
                {t("getStarted")}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="mx-auto hidden w-full max-w-7xl items-center justify-between px-6 py-5 md:flex">
        <Logo />

        <nav aria-label={t("primaryNav")} className="flex items-center gap-3">
          <Link href="/tools" className={deskLink}>
            {t("tools")}
          </Link>
          <SolutionsMenu label={t("solutions")} className={solutionsDesk} />
          <Link href="/blog" className={deskLink}>
            {t("blog")}
          </Link>

          {user ? (
            <>
              <span className="px-4 py-2 text-sm text-slate-300">{displayName}</span>
              <Link href="/dashboard" className={deskLink}>
                {t("dashboard")}
              </Link>
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
    <header className="border-b border-white/10 bg-slate-950">
      <div className="px-6 py-5">
        <Logo />
      </div>
    </header>
  );
}