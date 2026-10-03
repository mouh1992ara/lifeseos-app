import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta Tag Generator - Free SEO Title & Description Tool",
  description:
    "Create optimized SEO titles and meta descriptions for your web pages with the free LifeSeos Meta Tag Generator.",
  alternates: {
    canonical: "/tools/meta-tag-generator",
  },
  openGraph: {
    title: "Meta Tag Generator | LifeSeos",
    description:
      "Generate SEO-friendly page titles and meta descriptions quickly and easily.",
    url: "/tools/meta-tag-generator",
    type: "website",
  },
};

const metaTagGeneratorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos Meta Tag Generator",
  url: "https://www.lifeseos.com/tools/meta-tag-generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO tool for generating optimized page titles and meta descriptions.",
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

export default function MetaTagGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(metaTagGeneratorJsonLd),
        }}
      />

      {children}
    </>
  );
}