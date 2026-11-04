import type { Metadata } from "next";
import YouTubeDescriptionGeneratorClient from "./youtube-description-generator-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/youtube-description-generator",
    toolKey: "youtubeDescriptionGenerator",
  });
}


export default function YouTubeDescriptionGeneratorPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Description Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-description-generator",
    description:
      "Generate structured YouTube video descriptions based on a video topic, keyword, audience, description style and call to action.",
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

      <YouTubeDescriptionGeneratorClient />
    </>
  );
}