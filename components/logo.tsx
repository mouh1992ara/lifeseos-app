import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="
        group
        flex
        items-center
        gap-3
      "
    >

      <div
        className="
          relative
          h-[60px]
          w-[60px]
          shrink-0
          overflow-hidden
          rounded-xl
          transition
          duration-300
          group-hover:scale-105
        "
      >

        <Image
          src="/lifeseos-logo.png"
          alt="LifeSeos logo"
          width={60}
          height={60}
          priority
          className="
            h-[60px]
            w-[60px]
            object-cover
          "
        />

      </div>


      <div>

        <div
          className="
            text-2xl
            font-bold
            tracking-tight
            text-white
          "
        >
          LifeSeos
        </div>


        <div
          className="
            text-xs
            text-slate-300
          "
        >
          SEO tools for smarter growth
        </div>

      </div>


    </Link>
  );
}