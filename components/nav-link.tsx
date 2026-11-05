"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

/**
 * A header link that knows whether it points at the current page.
 *
 * next-intl's `usePathname` already strips the locale prefix, so the comparison
 * is between locale-less paths. A link is active for its own path and anything
 * nested under it, which is why `/tools` lights up on `/tools/page-speed`.
 */
export function NavLink({
  href,
  className = "",
  children,
  ...rest
}: ComponentProps<typeof Link>) {
  const pathname = usePathname() ?? "/";
  const target = String(href);
  const active =
    target === "/" ? pathname === "/" : pathname === target || pathname.startsWith(`${target}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? "nav-active" : ""}`}
      {...rest}
    >
      {children}
    </Link>
  );
}