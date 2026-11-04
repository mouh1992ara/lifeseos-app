import type { Metadata } from "next";

import { buildToolMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata({
    locale,
    path: "/tools/robots-txt-generator",
    toolKey: "robotsTxtGenerator",
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
