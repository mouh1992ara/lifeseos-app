import type { Metadata } from "next";
import YouTubeDescriptionGeneratorClient from "./youtube-description-generator-client";

export const metadata: Metadata = {
  title: "Free YouTube Description Generator | LifeSeos",
  description:
    "Generate clear and structured YouTube video descriptions based on your topic, keyword, audience and content style with the free LifeSeos YouTube Description Generator.",
  alternates: {
    canonical: "/tools/youtube-description-generator",
  },
  openGraph: {
    title: "Free YouTube Description Generator | LifeSeos",
    description:
      "Create structured YouTube video descriptions with keyword ideas, calls to action and practical formatting using LifeSeos.",
    url: "/tools/youtube-description-generator",
    type: "website",
  },
};

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