import type { Metadata } from "next";
import SerpSnippetPreviewClient from "./serp-snippet-preview-client";

export const metadata: Metadata = {
  title: "Free SERP Snippet Preview Tool | LifeSeos",
  description:
    "Preview how your page title, URL and meta description may appear in Google search results with the free LifeSeos SERP Snippet Preview tool.",
  alternates: {
    canonical: "/tools/serp-snippet-preview",
  },
  openGraph: {
    title: "Free SERP Snippet Preview Tool | LifeSeos",
    description:
      "Preview and improve your page title, URL and meta description before publishing with LifeSeos.",
    url: "/tools/serp-snippet-preview",
    type: "website",
  },
};

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