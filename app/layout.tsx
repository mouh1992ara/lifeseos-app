import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

import "./globals.css";


const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.lifeseos.com";


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "LifeSeos - Free SEO Tools for Smarter Growth",
    template: "%s | LifeSeos",
  },

  description:
    "Free SEO tools for website analysis, technical SEO, content optimization, metadata, sitemaps and smarter search growth.",

  applicationName: "LifeSeos",

  authors: [
    {
      name: "LifeSeos",
    },
  ],

  creator: "LifeSeos",

  publisher: "LifeSeos",

  category: "SEO Tools",

  keywords: [
    "SEO tools",
    "free SEO tools",
    "SEO analyzer",
    "website SEO checker",
    "technical SEO",
    "meta tag generator",
    "robots.txt generator",
    "XML sitemap generator",
    "keyword density checker",
    "HTTP status checker",
    "website optimization",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LifeSeos",
    title: "LifeSeos - Free SEO Tools for Smarter Growth",
    description:
      "Analyze websites, discover SEO issues and improve your search performance with free LifeSeos tools.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos - Free SEO Tools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "LifeSeos - Free SEO Tools for Smarter Growth",
    description:
      "Analyze websites, discover SEO issues and improve your search performance with free LifeSeos tools.",
    images: [
      "/twitter-image.png",
    ],
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
  };

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`
          ${geistSans.variable}
          min-h-screen
          bg-slate-950
          text-white
          antialiased
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">

            <SiteHeader />

            <main className="flex-1">
              {children}
            </main>

            <SiteFooter />

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
