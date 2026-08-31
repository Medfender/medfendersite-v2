"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [lang, setLang] = useState("EN");
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Audio", href: "/audio" },
    { label: "Store", href: "/store" },
    { label: "Media", href: "/media" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/45 border-b border-zinc-800/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-white group" aria-label="Medfender Home">
          <span className="text-cyan-300 group-hover:text-cyan-200 transition-colors">Med</span>fender
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "text-sm font-bold tracking-widest uppercase transition-colors relative",
                isActive(l.href)
                  ? "text-cyan-300"
                  : "text-zinc-400 hover:text-cyan-200",
                l.href === "/" ? "hidden md:inline-block" : "inline-block",
              ].join(" ")}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_12px_rgba(0,216,246,0.5)]" />
              )}
            </Link>
          ))}
          <button
            onClick={() => setLang((prev) => (prev === "EN" ? "FR" : "EN"))}
            className="text-xs font-extrabold uppercase tracking-widest border border-zinc-600/40 rounded-full px-3 py-1 text-zinc-300 hover:border-cyan-400/60 hover:text-cyan-200 transition bg-zinc-900/40 backdrop-blur-sm"
            aria-label="Toggle language"
          >
            {lang}
          </button>
        </div>
      </div>
    </nav>
  );
}
