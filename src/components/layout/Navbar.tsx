"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import CartDrawer from "./CartDrawer";

/* ════════════════════════════════════════════════════
   NAVIGATION LINKS
═══════════════════════════════════════════════════ */
const navLinks = [
  { label: "AUDIO", href: "/audio" },
  { label: "STORE", href: "/store" },
  { label: "MEDIA", href: "/media" },
  { label: "SUPPORT", href: "/support/setup-guide" },
];

/* ════════════════════════════════════════════════════
   NAVBAR — UFC-style magic-line underline via layoutId
═══════════════════════════════════════════════════ */
export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ── Scroll hide/reveal + transparent → solid ──
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Hide on scroll down past 80px
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Solid brutalist background past 50px
    setIsScrolled(latest > 50);
  });

  // ── Lock body scroll when mobile menu is open ──
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Main Header ── */}
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-120%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          isScrolled ? "bg-zinc-950 border-b border-zinc-900" : "bg-zinc-950/0 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* ── Brand ── */}
          <Link
            href="/"
            className="text-xl font-bold tracking-[0.2em] text-white uppercase shrink-0 hover:text-zinc-200 transition-colors"
            aria-label="MEDFENDER Home"
          >
            Medfender
          </Link>

          {/* ── Center: Desktop Nav with Gliding Underline ── */}
          <div
            className="hidden md:flex items-center space-x-8 h-full relative"
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label="Main navigation"
          >
            {navLinks.map((link, i) => (
              <div
                key={link.href}
                className="relative flex items-center h-full px-2"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                <Link
                  href={link.href}
                  className={[
                    "text-xs tracking-[0.2em] font-bold uppercase transition-colors z-10",
                    pathname.startsWith(link.href) ? "text-white" : "text-zinc-300 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}
                </Link>

                {/* Magic line — single shared layoutId */}
                <AnimatePresence>
                  {hoveredIndex === i && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-4 left-0 right-0 h-[3px] bg-[#E5A93C]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ── Right: Cart + CTA ── */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart (${itemCount} items)`}
              className="relative w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <ShoppingCart size={18} strokeWidth={2} />
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 right-0 -mt-1 -mr-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5A93C] text-black text-[9px] font-black flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* BOOK A SESSION CTA */}
            <Link
              href="mailto:contact@medfender.com"
              className="hidden md:flex items-center bg-[#E5A93C] text-black font-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-white transition-colors duration-150"
            >
              BOOK A SESSION
            </Link>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] text-zinc-400 hover:text-white transition-colors"
            >
              <span className="block w-6 h-[2px] bg-current" />
              <span className="block w-6 h-[2px] bg-current" />
              <span className="block w-4 h-[2px] bg-current" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile: Full-Screen Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-zinc-900">
              <span className="text-xl font-bold uppercase tracking-[0.2em] text-white">
                Medfender
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                </svg>
              </button>
            </div>

            {/* Nav links — blocky, massive */}
            <nav className="flex-1 flex flex-col justify-center px-6 gap-1" aria-label="Mobile navigation">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                    className={[
                      "block text-5xl md:text-6xl font-black uppercase tracking-tight leading-none py-3 transition-colors",
                      pathname.startsWith(link.href) ? "text-white" : "text-zinc-600 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + navLinks.length * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6"
              >
                <Link
                  href="mailto:contact@medfender.com"
                  onClick={() => setMobileOpen(false)}
                  className="inline-block bg-[#E5A93C] text-black font-black uppercase text-lg tracking-widest px-8 py-4 hover:bg-white transition-colors duration-150"
                >
                  BOOK A SESSION
                </Link>
              </motion.div>
            </nav>

            {/* Bottom bar */}
            <div className="border-t border-zinc-900 px-6 py-6 flex gap-8">
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">
                Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
