import type { Metadata } from "next";
import ArticleRewriterClient from "./article-rewriter-client";

export const metadata: Metadata = {
  title: "Free SEO Article Rewriter | LifeSeos",
  description:
    "Rewrite website articles for better clarity, readability, tone and SEO consistency with the free LifeSeos SEO Article Rewriter.",
  alternates: {
    canonical: "/tools/article-rewriter",
  },
  openGraph: {
    title: "Free SEO Article Rewriter | LifeSeos",
    description:
      "Rewrite website content while preserving meaning, structure and SEO relevance with LifeSeos.",
    url: "/tools/article-rewriter",
    type: "website",
  },
};

export default function ArticleRewriterPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos SEO Article Rewriter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/article-rewriter",
    description:
      "Rewrite website articles for improved clarity, readability, tone and SEO consistency while preserving the original meaning.",
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

      <ArticleRewriterClient />
    </>
  );
}