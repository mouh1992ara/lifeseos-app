"use client";

import { GlassRail, lgItem } from "@/components/glass/glass-rail";
import { SolutionsMenu } from "@/components/solutions-menu";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * The primary navigation, as a glass rail.
 *
 * Active state is derived from the pathname here rather than handed in, so the
 * indicator and the links can never disagree about which route is current.
 *
 * The top-level destinations live inside the rail; account actions sit outside it
 * on desktop. Mixing "Sign out" into a navigation pill blurs what the pill means:
 * the rail answers "where am I", not "what can I do". On mobile the account link
 * joins the rail because there is nowhere else to put it, and it is a navigation
 * destination there, not a destructive action.
 */
export function HeaderRail({
  labels,
  size = "md",
  className = "",
  variant = "dropdown",
  account,
}: {
  labels: { tools: string; solutions: string; blog: string };
  size?: "sm" | "md";
  className?: string;
  variant?: "dropdown" | "sheet";
  account?: { href: string; label: string };
}) {
  /* next-intl's usePathname strips the locale prefix. next/navigation's does
     not, which meant every comparison below failed outside English — the rail
     simply had no active item on /ar, /fr or /zh. */
  const pathname = usePathname() ?? "/";

  const isTools = pathname === "/tools" || pathname.startsWith("/tools/");
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const isSolutions = ["/for", "/about", "/audiences"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAccount = account ? pathname === account.href : false;

  const activeIndex = isTools ? 0 : isSolutions ? 1 : isBlog ? 2 : isAccount ? 3 : -1;

  const solutionsItem = lgItem(1, isSolutions);

  return (
    <GlassRail activeIndex={activeIndex} size={size} className={className}>
      <Link href="/tools" {...lgItem(0, isTools)}>
        {labels.tools}
      </Link>

      <SolutionsMenu
        label={labels.solutions}
        variant={variant}
        className={solutionsItem.className}
        itemProps={{
          "data-lg-item": solutionsItem["data-lg-item"],
          "data-active": solutionsItem["data-active"],
        }}
      />

      <Link href="/blog" {...lgItem(2, isBlog)}>
        {labels.blog}
      </Link>

      {account ? (
        <Link href={account.href} {...lgItem(3, isAccount)}>
          {account.label}
        </Link>
      ) : null}
    </GlassRail>
  );
}