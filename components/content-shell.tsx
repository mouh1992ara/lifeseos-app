"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { isTranslated } from "@/i18n/translated";

// Pages without translations render English inside the chosen locale's shell.
// The English body is forced LTR so it does not mirror under dir="rtl".
export default function ContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Banner");

  if (isTranslated(locale, pathname)) return <>{children}</>;

  return (
    <>
      <div
        role="note"
        className="border-b border-amber-400/20 bg-amber-400/10 px-6 py-2 text-center text-sm text-amber-200"
      >
        {t("text")}{" "}
        <Link href={pathname} locale="en" className="font-semibold underline underline-offset-4">
          {t("action")}
        </Link>
      </div>

      <div lang="en" dir="ltr" data-fallback="">
        {children}
      </div>
    </>
  );
}
