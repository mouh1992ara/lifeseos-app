import type { Metadata } from "next";
import YouTubeTitleGeneratorClient from "./youtube-title-generator-client";

export const metadata: Metadata = {
  title: "Free YouTube Title Generator | LifeSeos",
  description:
    "Generate engaging YouTube title ideas based on your video topic, keyword, style and audience with the free LifeSeos YouTube Title Generator.",
  alternates: {
    canonical: "/tools/youtube-title-generator",
  },
  openGraph: {
    title: "Free YouTube Title Generator | LifeSeos",
    description:
      "Create clear and engaging YouTube title ideas for your videos with LifeSeos.",
    url: "/tools/youtube-title-generator",
    type: "website",
  },
};

export default function YouTubeTitleGeneratorPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Title Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-title-generator",
    description:
      "Generate YouTube title ideas based on your video topic, keyword, title style and target audience.",
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

      <YouTubeTitleGeneratorClient />
    </>
  );
}