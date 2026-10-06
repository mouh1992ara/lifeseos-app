import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Status Checker - Free Website Response Code Tool",

  description:
    "Check website HTTP response codes, redirects and page availability with the free LifeSeos HTTP Status Checker.",

  alternates: {
    canonical: "/tools/http-status-checker",
  },

  openGraph: {
    title: "HTTP Status Checker | LifeSeos",
    description:
      "Check HTTP response codes, redirects and website availability for SEO and technical troubleshooting.",
    url: "/tools/http-status-checker",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/http-status-checker.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos HTTP Status Checker",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HTTP Status Checker | LifeSeos",
    description:
      "Check HTTP response codes, redirects and website availability for SEO and technical troubleshooting.",
    images: ["/social/http-status-checker.png"],
  },
};

const httpStatusCheckerJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LifeSeos HTTP Status Checker",
  url: "https://www.lifeseos.com/tools/http-status-checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "A free SEO and technical tool for checking HTTP response codes, redirects and website availability.",
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

export default function HTTPStatusCheckerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(httpStatusCheckerJsonLd),
        }}
      />

      {children}
    </>
  );
}