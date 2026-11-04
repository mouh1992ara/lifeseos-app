import type { Metadata } from "next";
import YouTubeKeywordIdeasClient from "./youtube-keyword-ideas-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/youtube-keyword-ideas",
    toolKey: "youtubeKeywordIdeas",
  });
}


export default function YouTubeKeywordIdeasPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Keyword Ideas",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-keyword-ideas",
    description:
      "Generate YouTube keyword ideas and video topic phrases based on a seed topic, search intent and content angle.",
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

      <YouTubeKeywordIdeasClient />
    </>
  );
}