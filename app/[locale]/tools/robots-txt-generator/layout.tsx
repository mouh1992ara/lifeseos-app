import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robots.txt Generator - Free SEO Crawling Tool",

  description:
    "Create a robots.txt file for your website and manage search engine crawler access with the free LifeSeos Robots.txt Generator.",

  alternates: {
    canonical: "/tools/robots-txt-generator",
  },

  openGraph: {
    title: "Robots.txt Generator | LifeSeos",
    description:
      "Generate robots.txt rules to guide search engine crawlers and control website access.",
    url: "/tools/robots-txt-generator",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/robots-txt-generator.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Robots.txt Generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Robots.txt Generator | LifeSeos",
    description:
      "Generate robots.txt rules to guide search engine crawlers and control website access.",
    images: ["/social/robots-txt-generator.png"],
  },
};

const robotsTxtGeneratorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos Robots.txt Generator",
  url: "https://www.lifeseos.com/tools/robots-txt-generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO tool for generating robots.txt rules to manage search engine crawler access.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "LifeSeos",
    url: "https://www.lifeseos.com",
  },
};

export default function RobotsTxtGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(robotsTxtGeneratorJsonLd),
        }}
      />

      {children}
    </>
  );
}