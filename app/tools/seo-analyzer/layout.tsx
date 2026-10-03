import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Analyzer - Free Website SEO Audit Tool",
  description:
    "Analyze your website SEO performance, technical issues, content signals, image SEO, social metadata, warnings and recommendations with the free LifeSeos SEO Analyzer.",
  alternates: {
    canonical: "/tools/seo-analyzer",
  },
  openGraph: {
    title: "SEO Analyzer - Free Website SEO Audit Tool | LifeSeos",
    description:
      "Run a free SEO audit and discover technical issues, content problems, image SEO gaps and optimization opportunities.",
    url: "/tools/seo-analyzer",
    type: "website",
  },
};

const seoAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos SEO Analyzer",
  url: "https://www.lifeseos.com/tools/seo-analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO analyzer for auditing technical SEO, content, images, social metadata, warnings and optimization opportunities.",
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

export default function SEOAnalyzerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoAnalyzerJsonLd),
        }}
      />

      {children}
    </>
  );
}