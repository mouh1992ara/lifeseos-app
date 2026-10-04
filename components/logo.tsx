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
          flex
          h-11
          w-11
          items-center
          justify-center
          overflow-hidden
          rounded-2xl
          bg-gradient-to-br
          from-blue-500
          via-indigo-500
          to-purple-600
          shadow-lg
          shadow-blue-500/30
          transition-all
          duration-300
          group-hover:scale-110
        "
      >

        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            rounded-2xl
            bg-white/20
            opacity-0
            blur-xl
            transition
            duration-300
            group-hover:opacity-100
          "
        />


        {/* Logo Icon */}
        <div
          className="
            relative
            text-xl
            font-black
            text-white
            transition
            duration-300
            group-hover:-translate-y-0.5
          "
        >
          L
        </div>


        {/* Growth signal */}
        <div
          className="
            absolute
            bottom-2
            right-2
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-400
            shadow
            shadow-emerald-300
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