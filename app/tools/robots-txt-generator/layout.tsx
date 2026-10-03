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
  },
};

export default function RobotsTxtGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
