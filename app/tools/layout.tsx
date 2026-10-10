import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free SEO Tools | LifeSeos",

  description:
    "Explore free LifeSeos tools for website analysis, technical SEO, content optimization, YouTube SEO, page speed, structured data and more.",

  alternates: {
    canonical: "/tools",
  },

  openGraph: {
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for website analysis, technical SEO, content optimization, YouTube SEO, page speed, structured data and more.",
    url: "/tools",
    type: "website",
    siteName: "LifeSeos",
    images: [
      {
        url: "/social/tools.png",
        width: 1200,
        height: 630,
        alt: "LifeSeos Free SEO Tools",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore free SEO tools for technical SEO, content optimization, website analysis, YouTube SEO and more.",
    images: ["/social/tools.png"],
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}