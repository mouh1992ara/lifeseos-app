import type { Metadata } from "next";
import YouTubeScriptWriterClient from "./youtube-script-writer-client";

export const metadata: Metadata = {
  title: "Free YouTube Script Writer | LifeSeos",
  description:
    "Generate structured YouTube video scripts with hooks, introductions, main points, transitions, calls to action and outros using the free LifeSeos YouTube Script Writer.",
  alternates: {
    canonical: "/tools/youtube-script-writer",
  },
  openGraph: {
    title: "Free YouTube Script Writer | LifeSeos",
    description:
      "Create structured YouTube video scripts based on your topic, audience, video length and content style with LifeSeos.",
    url: "/tools/youtube-script-writer",
    type: "website",
  },
};

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