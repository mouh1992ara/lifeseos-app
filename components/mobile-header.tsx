"use client";

import Link from "next/link";

import Logo from "@/components/logo";


export default function MobileHeader() {


  return (

    <header
      className="
        border-b
        border-white/10
        bg-slate-950
      "
    >


      <div
        className="
          flex
          flex-col
          items-center
          gap-3
          px-4
          Py-4
        "
      >


        {/* Logo */}

        <Logo />



        {/* Mobile navigation bar */}

        <div
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-3
            py-2
          "
        >


          <Link
            href="/tools"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Tools
          </Link>



          <Link
            href="/blog"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Blog
          </Link>



          <Link
            href="/auth/login"
            className="
              text-xs
              text-slate-300
              hover:text-white
            "
          >
            Sign In
          </Link>



          <Link
            href="/auth/sign-up"
            className="
              rounded-lg
              bg-gradient-to-r
              from-blue-500
              to-purple-600
              px-2.5
              py-1.5
              text-xs
              font-semibold
              text-white
            "
          >
            Get Started
          </Link>



        </div>


      </div>


    </header>

  );

}