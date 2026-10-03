import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML Sitemap Generator - Free SEO Sitemap Tool",
  description:
    "Create an XML sitemap for your website and help search engines discover your important pages with the free LifeSeos XML Sitemap Generator.",
  alternates: {
    canonical: "/tools/xml-sitemap-generator",
  },
  openGraph: {
    title: "XML Sitemap Generator | LifeSeos",
    description:
      "Generate XML sitemaps to help search engines discover and crawl your website pages.",
    url: "/tools/xml-sitemap-generator",
    type: "website",
  },
};

const xmlSitemapGeneratorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos XML Sitemap Generator",
  url: "https://www.lifeseos.com/tools/xml-sitemap-generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO tool for generating XML sitemaps to help search engines discover and crawl website pages.",
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

export default function XMLSitemapGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(xmlSitemapGeneratorJsonLd),
        }}
      />

      {children}
    </>
  );
}