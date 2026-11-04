import type { Metadata } from "next";
import YouTubeTitleAnalyzerClient from "./youtube-title-analyzer-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/youtube-title-analyzer",
    toolKey: "youtubeTitleAnalyzer",
  });
}


export default function YouTubeTitleAnalyzerPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Title Analyzer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-title-analyzer",
    description:
      "Check and analyze YouTube titles for clarity, keyword use, title structure, length and click appeal.",
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

      <YouTubeTitleAnalyzerClient />
    </>
  );
}
