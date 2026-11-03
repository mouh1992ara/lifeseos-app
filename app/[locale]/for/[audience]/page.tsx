import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AudiencePage from "@/components/audience-page";
import { audiences, type AudienceSlug } from "@/lib/audiences";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(audiences).map((audience) => ({ audience }));
}

type Props = { params: Promise<{ audience: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience: slug } = await params;
  const audience = audiences[slug as AudienceSlug];
  if (!audience) return {};

  const path = "/for/" + audience.slug;

  return {
    title: audience.metaTitle,
    description: audience.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: audience.metaTitle + " | LifeSeos",
      description: audience.metaDescription,
      url: path,
      siteName: "LifeSeos",
      type: "website",
      images: [
        { url: "/social/home.png", width: 1200, height: 630, alt: "LifeSeos SEO Tools" },
      ],
    },
  };
}

export default async function Page({ params }: Props) {
  const { audience: slug } = await params;
  const audience = audiences[slug as AudienceSlug];
  if (!audience) notFound();
  return <AudiencePage audience={audience} />;
}
