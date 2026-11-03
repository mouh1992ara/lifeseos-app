import type { Metadata } from "next";
import YouTubeKeywordIdeasClient from "./youtube-keyword-ideas-client";

export const metadata: Metadata = {
  title: "Free YouTube Keyword Ideas Tool | LifeSeos",
  description:
    "Generate YouTube keyword and topic ideas for videos based on your seed topic, search intent and content angle with the free LifeSeos YouTube Keyword Ideas tool.",
  alternates: {
    canonical: "/tools/youtube-keyword-ideas",
  },
  openGraph: {
    title: "Free YouTube Keyword Ideas Tool | LifeSeos",
    description:
      "Discover YouTube keyword ideas, long-tail phrases and video topic angles with LifeSeos.",
    url: "/tools/youtube-keyword-ideas",
    type: "website",
  },
};

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