"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const [lang, setLang] = useState("EN");
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Audio", href: "/audio" },
    { label: "Store", href: "/store" },
    { label: "Media", href: "/media" },
    { label: "Support", href: "/support/setup-guide" },
    { label: "Contact", href: "/contact" },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/45 border-b border-zinc-800/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="text-lg md:text-2xl font-extrabold tracking-tight text-white group shrink-0" aria-label="Medfender Home">
            <span className="text-cyan-300 group-hover:text-cyan-200 transition-colors">Med</span>fender
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "text-sm font-bold tracking-widest uppercase transition-colors relative",
                  isActive(l.href)
                    ? "text-cyan-300"
                    : "text-zinc-400 hover:text-cyan-200",
                  l.href === "/" ? "hidden" : "",
                ].join(" ")}
                aria-current={isActive(l.href) ? "page" : undefined}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_12px_rgba(0,216,246,0.5)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Controls: lang + cart (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLang((prev) => (prev === "EN" ? "FR" : "EN"))}
              className="text-xs font-extrabold uppercase tracking-widest border border-zinc-600/40 rounded-full px-3 py-1 text-zinc-300 hover:border-cyan-400/60 hover:text-cyan-200 transition bg-zinc-900/40 backdrop-blur-sm"
              aria-label="Toggle language"
            >
              {lang}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart (${itemCount} items)`}
              className="relative w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/60 hover:border-cyan-400/60 hover:bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-cyan-300 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
            >
              <ShoppingCart size={16} />
              {itemCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.7)] ring-2 ring-zinc-950">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: hamburger + overlay drawer */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLang((prev) => (prev === "EN" ? "FR" : "EN"))}
              className="text-[10px] font-extrabold uppercase tracking-widest border border-zinc-600/40 rounded-full px-2 py-0.5 text-zinc-300 hover:border-cyan-400/60 hover:text-cyan-200 transition bg-zinc-900/40"
              aria-label="Toggle language"
            >
              {lang}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${itemCount} items)`}
              className="relative w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300"
            >
              <ShoppingCart size={13} />
              {itemCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="w-8 h-8 rounded-md border border-zinc-700/60 bg-zinc-900/80 flex flex-col items-center justify-center gap-1.5 hover:border-cyan-400/40 transition"
            >
              <span className={`block w-4 h-px bg-zinc-300 transition-all ${mobileOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
              <span className={`block w-4 h-px bg-zinc-300 transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-px bg-zinc-300 transition-all ${mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "py-2.5 px-3 rounded-md text-sm font-bold tracking-widest uppercase transition-colors",
                    isActive(l.href)
                      ? "text-cyan-300 bg-cyan-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]",
                  ].join(" ")}
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
