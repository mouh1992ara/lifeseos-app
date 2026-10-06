import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Speed Analyzer - Free Lighthouse Performance Tool",

  description:
    "Measure website performance, loading speed and Lighthouse metrics including performance score, First Contentful Paint, Largest Contentful Paint, layout stability and blocking time with the free LifeSeos Page Speed Analyzer.",

  alternates: {
    canonical: "/tools/page-speed",
  },

  openGraph: {
    title: "Page Speed Analyzer | LifeSeos",
    description:
      "Measure website performance, loading speed and Lighthouse metrics with the free LifeSeos Page Speed Analyzer.",
    url: "/tools/page-speed",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/page-speed.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Page Speed Analyzer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Page Speed Analyzer | LifeSeos",
    description:
      "Measure website performance, loading speed and Lighthouse metrics with the free LifeSeos Page Speed Analyzer.",
    images: ["/social/page-speed.png"],
  },
};

const pageSpeedAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos Page Speed Analyzer",
  url: "https://www.lifeseos.com/tools/page-speed",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free website performance tool for measuring Lighthouse metrics including performance score, loading speed, layout stability and blocking time.",
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

export default function PageSpeedAnalyzerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSpeedAnalyzerJsonLd),
        }}
      />
      {children}
    </>
  );
}
