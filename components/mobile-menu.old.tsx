"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {

  const [open, setOpen] = useState(false);


  return (
    <div className="relative">

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle mobile menu"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-white/20
          bg-slate-950
          text-xl
          text-white
          transition
          hover:bg-white/10
        "
      >
        {open ? "×" : "☰"}
      </button>


      {open && (

        <div
          className="
            absolute
            right-0
            top-14
            z-50
            w-64
            rounded-xl
            border
            border-white/10
            bg-slate-950
            p-5
            shadow-xl
          "
        >

          <Link
            href="/tools"
            className="
              block
              py-3
              text-slate-200
            "
          >
            Tools
          </Link>


          <Link
            href="/blog"
            className="
              block
              py-3
              text-slate-200
            "
          >
            Blog
          </Link>


          <Link
            href="/auth/login"
            className="
              block
              py-3
              text-slate-200
            "
          >
            Sign in
          </Link>


        </div>

      )}

    </div>
  );
}