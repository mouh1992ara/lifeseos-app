import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error: string }>;
};

async function ErrorContent({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: Promise<{ error: string }>;
}) {
  const t = await getTranslations({ locale, namespace: "Auth.error" });
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          {t("codeError", { code: params.error })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("fallback")}</p>
      )}
    </>
  );
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Auth.error" });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent locale={locale} searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
