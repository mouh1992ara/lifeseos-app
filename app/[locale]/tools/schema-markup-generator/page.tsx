import type { Metadata } from "next";
import SchemaMarkupGeneratorClient from "./schema-markup-generator-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/schema-markup-generator",
    toolKey: "schemaMarkupGenerator",
  });
}


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