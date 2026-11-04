import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InfoIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

type Props = { params: Promise<{ locale: string }> };

export default async function ProtectedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Protected");

  return (
    <div className="flex w-full flex-1 flex-col gap-12 pt-10">
      <div className="flex w-full items-center gap-3 rounded-md bg-white/[0.06] p-3 px-5 text-sm">
        <InfoIcon size="16" strokeWidth={2} className="shrink-0" />
        {t("notice")}
      </div>

      <div className="flex flex-col items-start gap-2">
        <h2 className="mb-4 text-2xl font-bold">{t("detailsTitle")}</h2>
        <pre className="max-h-32 max-w-full overflow-auto rounded border border-white/10 p-3 font-mono text-xs">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
    </div>
  );
}