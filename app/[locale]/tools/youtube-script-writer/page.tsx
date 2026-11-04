import type { Metadata } from "next";
import YouTubeScriptWriterClient from "./youtube-script-writer-client";
import { buildToolMetadata } from "@/lib/seo";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/youtube-script-writer",
    toolKey: "youtubeScriptWriter",
  });
}


export default function YouTubeScriptWriterPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Script Writer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-script-writer",
    description:
      "Generate structured YouTube video scripts with hooks, introductions, main points, transitions, calls to action and outros.",
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

      <YouTubeScriptWriterClient />
    </>
  );
}