import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyword Density Checker - Free SEO Content Tool",
  description:
    "Check keyword usage and keyword density in your content with the free LifeSeos Keyword Density Checker.",
  alternates: {
    canonical: "/tools/keyword-density-checker",
  },
  openGraph: {
    title: "Keyword Density Checker | LifeSeos",
    description:
      "Analyze keyword usage and improve content balance with a simple free SEO checker.",
    url: "/tools/keyword-density-checker",
    type: "website",
  },
};

export default function KeywordDensityCheckerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
