import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Noto_Sans_Arabic,
  Noto_Sans_SC,
  Noto_Serif_SC,
} from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import ContentShell from "@/components/content-shell";
import LivePresence from "@/components/live-presence";
import MotionProvider from "@/components/motion-provider";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { routing } from "@/i18n/routing";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com";

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  ar: "ar_AR",
  fr: "fr_FR",
  zh: "zh_CN",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "LifeSeos - Free SEO Tools for Smarter Growth",
      template: "%s | LifeSeos",
    },
    description:
      "Free SEO tools for website analysis, technical SEO, on-page optimization, content analysis, page speed, metadata, sitemaps and smarter search growth.",
    applicationName: "LifeSeos",
    creator: "LifeSeos",
    publisher: "LifeSeos",
    alternates: { canonical: locale === "en" ? "/" : `/${locale}` },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_US",
      url: siteUrl,
      siteName: "LifeSeos",
      title: "LifeSeos - Free SEO Tools for Smarter Growth",
      description:
        "Analyze websites, discover SEO issues and optimize your website with free LifeSeos SEO tools.",
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: "LifeSeos SEO Tools" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LifeSeos - Free SEO Tools for Smarter Growth",
      description: "Free SEO tools for website analysis and optimization.",
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

  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass =
    locale === "ar"
      ? arabic.variable
      : locale === "zh"
        ? `${zhSans.variable} ${zhSerif.variable}`
        : "";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
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
          <PageVisitTracker />

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

              <main className="flex-1">
                <ContentShell>{children}</ContentShell>
              </main>

              <SiteFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
