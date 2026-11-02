import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";

import SeoAnalyzerArClient from "./seo-analyzer-ar-client";

const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const title = "محلل السيو المجاني: افحص موقعك في ثوانٍ";
const description =
  "أداة مجانية لتحليل السيو بالعربية: افحص عنوان الصفحة ووصف الميتا وH1 والرابط الأساسي والصور وبيانات المشاركة، واحصل على توصيات واضحة وأزرار لإصلاح المشاكل.";

export const metadata: Metadata = {
  title,
  description,

  alternates: {
    canonical: "/ar/tools/seo-analyzer",
    languages: {
      en: "/tools/seo-analyzer",
      ar: "/ar/tools/seo-analyzer",
      "x-default": "/tools/seo-analyzer",
    },
  },

  openGraph: {
    title,
    description,
    url: "/ar/tools/seo-analyzer",
    type: "website",
    siteName: "LifeSeos",
    locale: "ar_AR",
    images: [
      {
        url: "/social/home.png",
        width: 1200,
        height: 630,
        alt: "محلل السيو من LifeSeos",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/social/home.png"],
  },
};

export default function ArabicSeoAnalyzerPage() {
  return (
    <div dir="rtl" lang="ar" className={arabicFont.className}>
      <SeoAnalyzerArClient />
    </div>
  );
}
