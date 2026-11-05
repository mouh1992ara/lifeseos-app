import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Protected");

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 text-white">
      <div className="flex w-full flex-1 flex-col items-center gap-12">
        <nav className="w-full border-b border-white/10">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4 text-sm">
            <Link href="/" className="font-semibold transition hover:text-emerald-300">
              LifeSeos
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/15 px-3 py-1.5 transition hover:bg-white/10"
            >
              {t("backToDashboard")}
            </Link>
          </div>
        </nav>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 pb-16">
          {children}
        </div>
      </div>
    </main>
  );
}