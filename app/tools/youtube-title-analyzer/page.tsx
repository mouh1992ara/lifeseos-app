import type { Metadata } from "next";
import YouTubeTitleAnalyzerClient from "./youtube-title-analyzer-client";

export const metadata: Metadata = {
  title: "Free YouTube Title Analyzer | LifeSeos",
  description:
    "Analyze your YouTube title for clarity, keyword use, structure, length and click appeal with the free LifeSeos YouTube Title Analyzer.",
  alternates: {
    canonical: "/tools/youtube-title-analyzer",
  },
  openGraph: {
    title: "Free YouTube Title Analyzer | LifeSeos",
    description:
      "Review and improve your YouTube video title with practical title insights from LifeSeos.",
    url: "/tools/youtube-title-analyzer",
    type: "website",
  },
};

export default function YouTubeTitleAnalyzerPage() {
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LifeSeos YouTube Title Analyzer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.lifeseos.com/tools/youtube-title-analyzer",
    description:
      "Analyze YouTube titles for clarity, keyword use, title structure, length and click appeal.",
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