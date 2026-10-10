import type { Metadata } from "next";
import SchemaMarkupGeneratorClient from "./schema-markup-generator-client";

export const metadata: Metadata = {
  title: "Free Schema Markup Generator | LifeSeos",
  description:
    "Generate JSON-LD schema markup for articles, FAQs, products, local businesses, breadcrumbs, organizations, websites and people with the free LifeSeos Schema Markup Generator.",
  alternates: {
    canonical: "/tools/schema-markup-generator",
  },
  openGraph: {
    title: "Free Schema Markup Generator | LifeSeos",
    description:
      "Create structured JSON-LD schema markup for common website content types with LifeSeos.",
    url: "https://www.lifeseos.com/tools/schema-markup-generator",
    type: "website",
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LifeSeos Schema Markup Generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.lifeseos.com/tools/schema-markup-generator",
  description:
    "Generate JSON-LD schema markup for Article, FAQ, Product, LocalBusiness, BreadcrumbList, Organization, WebSite and Person structured data.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function SchemaMarkupGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />

      <SchemaMarkupGeneratorClient />
    </>
  );
}