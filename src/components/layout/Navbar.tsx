"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import BookSessionButton from "@/components/BookSessionButton";
import { useCart } from "@/lib/CartContext";
import CartDrawer from "./CartDrawer";

/* ════════════════════════════════════════════════════
   NAVIGATION — ordered the way a set is ordered:
   the room, the sound, the school, the shop, the archive.
   The Fretboard is the instrument; it sits after the archive.
   ═══════════════════════════════════════════════════ */
const navLinks = [
  { label: "Live", href: "/live" },
  { label: "Audio", href: "/audio" },
  { label: "Academy", href: "/academy" },
  { label: "Store", href: "/store" },
  { label: "Media", href: "/media" },
  { label: "Fretboard", href: "/fretboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  // The landing page opens on a full-bleed photograph: let the nav sit on the
  // image, then turn solid once the page starts moving.
  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !mobileOpen;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape closes the menu.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={[
          "top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          isHome ? "fixed inset-x-0" : "sticky",
          overHero
            ? "border-transparent bg-transparent"
            : "border-[var(--rule)] bg-paper/92 shadow-[0_1px_0_rgba(18,18,16,0.04)] backdrop-blur-[6px]",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1560px] items-center justify-between gap-6 px-5 md:h-[4.5rem] md:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex shrink-0 items-baseline gap-2.5"
            aria-label="Medfender — home"
          >
            <span
              className={`font-display text-[1.55rem] leading-none tracking-[-0.02em] transition-colors duration-300 ${
                overHero ? "text-cream" : "text-ink"
              }`}
            >
              Medfender
            </span>
            <span
              className={`hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-300 sm:inline ${
                overHero ? "text-cream/60" : "text-ink/60"
              }`}
            >
              Marrakech
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "relative flex min-h-[44px] items-center px-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors",
                        active
                          ? overHero
                            ? "text-brass-light"
                            : "text-rust"
                          : overHero
                            ? "text-cream/72 hover:text-cream"
                            : "text-ink/62 hover:text-ink",
                      ].join(" ")}
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className={[
                          "absolute inset-x-3 bottom-2 h-px origin-left bg-current transition-transform duration-200",
                          active ? "scale-x-100" : "scale-x-0",
                        ].join(" ")}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Cart + booking + mobile trigger */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className={[
                "relative flex h-11 w-11 items-center justify-center border border-transparent transition-colors",
                overHero
                  ? "text-cream/80 hover:border-cream/30 hover:text-cream"
                  : "text-ink/70 hover:border-[var(--rule)] hover:text-ink",
              ].join(" ")}
            >
              <ShoppingCart size={18} strokeWidth={1.75} aria-hidden />
              {itemCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-rust px-1 font-mono text-[0.55rem] leading-none text-cream">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </button>

            <div className="hidden sm:block">
              <BookSessionButton tone={overHero ? "paper" : "ink"} />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={[
                "flex h-11 w-11 flex-col items-center justify-center gap-[5px] border transition-colors lg:hidden",
                overHero
                  ? "border-cream/30 text-cream hover:border-cream/60"
                  : "border-[var(--rule)] text-ink hover:border-ink",
              ].join(" ")}
            >
              <span aria-hidden className="block h-px w-5 bg-current" />
              <span aria-hidden className="block h-px w-5 bg-current" />
              <span aria-hidden className="block h-px w-3.5 bg-current" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: a page of the notebook, not a full-screen advert */}
      {mobileOpen ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[60] flex flex-col bg-paper lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--rule)] px-5">
            <span className="font-display text-[1.55rem] leading-none text-ink">Medfender</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center border border-[var(--rule)] text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul>
              {navLinks.map((link, index) => (
                <li key={link.href} className="border-b border-[var(--rule)]">
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-baseline justify-between gap-4 py-4"
                  >
                    <span
                      className={`font-display text-[2rem] leading-none tracking-[-0.02em] ${
                        isActive(link.href) ? "text-rust" : "text-ink"
                      }`}
                    >
                      {link.label}
                    </span>
                    <span className="font-mono text-[0.7rem] tabular-nums text-ink/60">
                      {String(index).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <BookSessionButton />
              <Link
                href="/contact"
                className="link-rule"
                onClick={() => setMobileOpen(false)}
              >
                Contact
                <span aria-hidden>→</span>
              </Link>
            </div>
          </nav>
        </div>
      ) : null}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
