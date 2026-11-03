import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import ArabicAnalyzer from "./ar-client";
import EnglishAnalyzer from "./en-client";

type Props = { params: Promise<{ locale: string }> };

const arTitle = "محلل السيو المجاني: افحص موقعك في ثوانٍ";
const arDescription =
  "أداة مجانية لتحليل السيو بالعربية: افحص عنوان الصفحة ووصف الميتا وH1 والرابط الأساسي والصور وبيانات المشاركة، واحصل على توصيات واضحة وأزرار لإصلاح المشاكل.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Other locales inherit the English metadata from the tool layout.
  if (locale !== "ar") return {};

  return {
    title: arTitle,
    description: arDescription,
    alternates: {
      canonical: "/ar/tools/seo-analyzer",
      languages: {
        en: "/tools/seo-analyzer",
        ar: "/ar/tools/seo-analyzer",
        "x-default": "/tools/seo-analyzer",
      },
    },
    openGraph: {
      title: arTitle,
      description: arDescription,
      url: "/ar/tools/seo-analyzer",
      type: "website",
      siteName: "LifeSeos",
      locale: "ar_AR",
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: "محلل السيو من LifeSeos" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: arTitle,
      description: arDescription,
      images: ["/social/home.png"],
    },
  };
}

export default async function SeoAnalyzerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "ar") {
    // data-no-motion: the Arabic analyzer ships its own ar-* animations.
    return (
      <div dir="rtl" lang="ar" data-no-motion="">
        <ArabicAnalyzer />
      </div>
    );
  }

  return <EnglishAnalyzer />;
}
