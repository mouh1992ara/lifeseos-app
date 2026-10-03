import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Status Checker - Free Website Response Code Tool",
  description:
    "Check HTTP status codes, redirects, and website response information with the free LifeSeos HTTP Status Checker.",
  alternates: {
    canonical: "/tools/http-status-checker",
  },
  openGraph: {
    title: "HTTP Status Checker | LifeSeos",
    description:
      "Check website HTTP response codes, redirects, and technical status information quickly and easily.",
    url: "/tools/http-status-checker",
    type: "website",
  },
};

export default function HTTPStatusCheckerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
