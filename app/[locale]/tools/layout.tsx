import type { ReactNode } from "react";

// The tools index generates its own localized metadata in page.tsx, and each
// tool overrides it in <tool>/layout.tsx. Nothing to add at this level.
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
