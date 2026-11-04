import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Noto_Sans_Arabic,
  Noto_Sans_SC,
  Noto_Serif_SC,
} from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import LivePresence from "@/components/live-presence";
import MotionProvider from "@/components/motion-provider";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import {
  buildLanguageAlternates,
  localeMeta,
  localizePath,
  routing,
  type Locale,
} from "@/i18n/config";

import PageVisitTracker from "../page-visit-tracker";
import "../globals.css";
import "../i18n.css";

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ar",
});

const zhSans = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-zh-sans",
});

const zhSerif = Noto_Serif_SC({
  weight: ["600", "900"],
  display: "swap",
  preload: false,
  variable: "--font-zh-serif",
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const meta = localeMeta[locale as Locale] ?? localeMeta.en;
  const canonical = localizePath(locale as Locale, "/");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("siteTitle"),
      template: `%s | LifeSeos`,
    },
    description: t("siteDescription"),
    applicationName: "LifeSeos",
    creator: "LifeSeos",
    publisher: "LifeSeos",
    alternates: {
      canonical,
      languages: buildLanguageAlternates(siteUrl, "/"),
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: siteUrl + canonical,
      siteName: "LifeSeos",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: t("siteTitle") },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: ["/social/home.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: { other: { "baidu-site-verification": "codeva-GvjC1XoP41" } },
  };
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LifeSeos",
  url: "https://www.lifeseos.com",
  description: "Free SEO tools for website analysis and optimization.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LifeSeos",
  url: "https://www.lifeseos.com",
  logo: "https://www.lifeseos.com/icon.png",
};

// Runs before first paint. Motion is only enabled when the visitor has not
// asked for reduced motion; without JS the page is simply visible.
const motionBootstrap =
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-on')}catch(e){}";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const meta = localeMeta[locale as Locale];
  const dir = meta.dir;
  const fontClass =
    locale === "ar"
      ? arabic.variable
      : locale === "zh"
        ? `${zhSans.variable} ${zhSerif.variable}`
        : "";

  return (
    <html lang={meta.htmlLang} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4870397991437721"
          crossOrigin="anonymous"
        />
      </head>

      <body className={`min-h-screen bg-slate-950 text-white antialiased ${fontClass}`}>
        <script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <MotionProvider />

            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <LivePresence />

              <main className="flex-1">{children}</main>

              <SiteFooter />
            </div>
          </ThemeProvider>
          <PageVisitTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
