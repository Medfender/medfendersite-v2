"use client";

import React, { useState } from "react";

export default function Navbar() {
  const [lang, setLang] = useState("EN");
  const links = [
    { label: "Audio", href: "#audio" },
    { label: "Store", href: "#store" },
    { label: "Media", href: "#media" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-neutral-950/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
          <span className="text-cyan-400">Med</span>fender
        </a>
        <div className="flex items-center gap-6 md:gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-neutral-300 hover:text-cyan-300 transition hidden md:inline-block"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setLang((prev) => (prev === "EN" ? "FR" : "EN"))}
            className="text-xs font-extrabold uppercase tracking-wide border border-white/10 rounded-full px-3 py-1 text-neutral-300 hover:border-cyan-400 hover:text-cyan-300 transition"
            aria-label="Toggle language"
          >
            {lang}
          </button>
        </div>
      </div>
    </nav>
  );
}
