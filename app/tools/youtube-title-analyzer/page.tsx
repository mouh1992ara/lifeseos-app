import type { Metadata } from "next";
import YouTubeTitleAnalyzerClient from "./youtube-title-analyzer-client";

export const metadata: Metadata = {
  title: "Free YouTube Title Checker & Analyzer | LifeSeos",
  description:
    "Use the free LifeSeos YouTube Title Checker and Analyzer to review title length, keyword use, clarity, structure and click appeal before publishing.",
  alternates: {
    canonical: "/tools/youtube-title-analyzer",
  },
  openGraph: {
    title: "Free YouTube Title Checker & Analyzer | LifeSeos",
    description:
      "Check and test your YouTube video title for clarity, keyword use, length and click appeal with LifeSeos.",
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
