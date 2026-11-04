import type { Metadata } from "next";
import ArticleRewriterClient from "./article-rewriter-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/article-rewriter",
    toolKey: "articleRewriter",
  });
}


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