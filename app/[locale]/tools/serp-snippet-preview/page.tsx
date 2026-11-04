import type { Metadata } from "next";
import SerpSnippetPreviewClient from "./serp-snippet-preview-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/serp-snippet-preview",
    toolKey: "serpSnippetPreview",
  });
}


export default function SerpSnippetPreviewPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos SERP Snippet Preview",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/serp-snippet-preview",
    description:
      "Preview how a page title, URL and meta description may appear in search engine results.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />

      <SerpSnippetPreviewClient />
    </>
  );
}