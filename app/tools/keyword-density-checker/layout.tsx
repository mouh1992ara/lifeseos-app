import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyword Density Checker - Free SEO Content Tool",
  description:
    "Check keyword frequency, density and content distribution with the free LifeSeos Keyword Density Checker.",
  alternates: {
    canonical: "/tools/keyword-density-checker",
  },
  openGraph: {
    title: "Keyword Density Checker | LifeSeos",
    description:
      "Analyze keyword frequency and density to improve SEO content optimization.",
    url: "/tools/keyword-density-checker",
    type: "website",
  },
};

const keywordDensityCheckerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos Keyword Density Checker",
  url: "https://www.lifeseos.com/tools/keyword-density-checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO content tool for checking keyword frequency, density and distribution.",
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

export default function KeywordDensityCheckerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(keywordDensityCheckerJsonLd),
        }}
      />

      {children}
    </>
  );
}