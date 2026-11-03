import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Page Analyzer - On-Page SEO Analysis Tool",

  description:
    "Run a free SEO page analysis to check page titles, meta descriptions, headings, canonical tags, links and image alt text with LifeSeos.",

  alternates: {
    canonical: "/tools/seo-page-analyzer",
  },

  openGraph: {
    title: "Free SEO Page Analyzer - On-Page SEO Analysis Tool | LifeSeos",
    description:
      "Analyze titles, meta descriptions, headings, canonical tags, links and image SEO with the free LifeSeos SEO Page Analyzer.",
    url: "/tools/seo-page-analyzer",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/seo-page-analyzer.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos SEO Page Analyzer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free SEO Page Analyzer - On-Page SEO Analysis Tool | LifeSeos",
    description:
      "Analyze titles, meta descriptions, headings, canonical tags, links and image SEO with the free LifeSeos SEO Page Analyzer.",
    images: ["/social/seo-page-analyzer.png"],
  },
};

const seoPageAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos SEO Page Analyzer",
  url: "https://www.lifeseos.com/tools/seo-page-analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO page analyzer for checking page titles, meta descriptions, headings, canonical tags, links and image alt text.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function SEOPageAnalyzerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoPageAnalyzerJsonLd),
        }}
      />

      {children}
    </>
  );
}
