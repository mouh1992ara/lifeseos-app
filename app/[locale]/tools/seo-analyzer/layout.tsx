// Localized <head> metadata lives in page.tsx (generateMetadata).
// This layout only adds the WebApplication structured data.
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

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.lifeseos.com"
).replace(/\/+$/, "");

export default async function SEOAnalyzerLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const jsonLd = {
    ...seoAnalyzerJsonLd,
    inLanguage: locale,
    url: `${siteUrl}${locale === "en" ? "" : `/${locale}`}/tools/seo-analyzer`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}