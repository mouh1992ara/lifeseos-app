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

export default function MetaTagGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
