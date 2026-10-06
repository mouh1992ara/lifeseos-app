import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Tools - Website Analysis & Optimization",

  description:
    "Explore 9 free LifeSeos tools for website analysis, technical SEO, on-page SEO, metadata, keyword density, HTTP status checks, page speed, content analysis, robots.txt and XML sitemaps.",

  alternates: {
    canonical: "/tools",
  },

  openGraph: {
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for website analysis, technical SEO, on-page optimization, content analysis, page speed, metadata, sitemaps and more.",
    url: "/tools",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/tools.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Free SEO Tools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for website analysis, technical SEO, content optimization, page speed, metadata and more.",
    images: ["/social/tools.png"],
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </div>
    </section>
  );
}