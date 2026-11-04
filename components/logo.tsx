import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function Logo() {
  const t = await getTranslations("Logo");

  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/lifeseos-logo.png"
          alt={t("alt")}
          width={60}
          height={60}
          priority
          className="h-[60px] w-[60px] object-cover"
        />
      </div>

      <div>
        {/* The wordmark stays Latin in every locale. */}
        <div className="text-2xl font-bold tracking-tight text-white" data-latin>
          LifeSeos
        </div>

        <div className="text-xs text-slate-300">{t("tagline")}</div>
      </div>
    </Link>
  );
}