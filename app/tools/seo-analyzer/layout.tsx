import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Analyzer - Free Website SEO Audit Tool",
  description:
    "Analyze your website SEO performance, technical issues, content signals, image SEO, social metadata, warnings and recommendations with the free LifeSeos SEO Analyzer.",
  alternates: {
    canonical: "/tools/seo-analyzer",
  },
  openGraph: {
    title: "SEO Analyzer - Free Website SEO Audit Tool | LifeSeos",
    description:
      "Run a free SEO audit and discover technical issues, content problems, image SEO gaps and optimization opportunities.",
    url: "/tools/seo-analyzer",
    type: "website",
  },
};

export default function SEOAnalyzerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
