import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/**
 * The logo. `compact` drops the tagline for the mobile bar, where vertical
 * space belongs to navigation rather than a second line of branding.
 */
export default async function Logo({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("Logo");

  const size = compact ? 36 : 44;

  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5"
      aria-label={t("alt")}
    >
      <span
        className="relative shrink-0 overflow-hidden rounded-[11px] ring-1 ring-white/10 transition duration-300 group-hover:scale-[1.04] group-hover:ring-emerald-400/30"
        style={{ width: size, height: size }}
      >
        <Image
          src="/lifeseos-logo.png"
          alt={t("alt")}
          width={size}
          height={size}
          priority
          className="h-full w-full object-cover"
        />
      </span>

      <span className="flex flex-col">
        {/* The wordmark stays Latin in every locale. */}
        <span
          className={`font-bold leading-none tracking-tight text-white ${compact ? "text-[17px]" : "text-xl"}`}
          data-latin
        >
          LifeSeos
        </span>

        {!compact && (
          <span className="mt-1 text-[10.5px] leading-none text-slate-400">
            {t("tagline")}
          </span>
        )}
      </span>
    </Link>
  );
}