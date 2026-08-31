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

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/45 border-b border-zinc-800/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-white group" aria-label="Medfender Home">
            <span className="text-cyan-300 group-hover:text-cyan-200 transition-colors">Med</span>fender
          </Link>
          <div className="flex items-center gap-5 md:gap-8">
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

            {/* CART ICON */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart (${itemCount} items)`}
              className="relative w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/60 hover:border-cyan-400/60 hover:bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-cyan-300 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_0_0_0_rgba(0,216,246,0)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_0_12px_rgba(0,216,246,0.2)]"
            >
              <ShoppingCart size={16} />
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.7)] ring-2 ring-zinc-950"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
