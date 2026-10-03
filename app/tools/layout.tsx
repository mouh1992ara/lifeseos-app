import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Tools",
  description:
    "Explore free SEO tools from LifeSeos for website analysis, technical SEO, metadata generation, keyword checking, HTTP status checks, robots.txt and XML sitemaps.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Free SEO Tools | LifeSeos",
    description:
      "Explore powerful free SEO tools for website analysis, technical SEO, metadata, keywords, sitemaps and more.",
    url: "/tools",
    type: "website",
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </div>
    </section>
  );
}