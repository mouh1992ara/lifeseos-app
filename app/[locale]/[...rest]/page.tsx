import { notFound } from "next/navigation";

// Unknown URLs inside a locale render the locale-aware not-found page.
export default function CatchAllPage() {
  notFound();
}
