import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Analyzer - Free SEO Content Analysis Tool",

  description:
    "Analyze content length, readability, keyword usage, keyword density and basic SEO quality signals with the free LifeSeos Content Analyzer.",

  alternates: {
    canonical: "/tools/content-analyzer",
  },

  openGraph: {
    title: "Content Analyzer | LifeSeos",
    description:
      "Analyze content length, readability, keyword usage and SEO quality signals with the free LifeSeos Content Analyzer.",
    url: "/tools/content-analyzer",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/content-analyzer.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Content Analyzer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Content Analyzer | LifeSeos",
    description:
      "Analyze content length, readability, keyword usage and SEO quality signals with the free LifeSeos Content Analyzer.",
    images: ["/social/content-analyzer.png"],
  },
};

const contentAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos Content Analyzer",
  url: "https://www.lifeseos.com/tools/content-analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO content analysis tool for checking content length, readability, keyword usage, keyword density and basic SEO quality signals.",
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

export default function ContentAnalyzerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contentAnalyzerJsonLd),
        }}
      />
      {children}
    </>
  );
}
