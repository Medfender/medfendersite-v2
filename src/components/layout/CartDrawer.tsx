"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { isCheckoutLive } from "@/lib/checkout";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { cartItems, removeFromCart, cartTotal, itemCount, clearCart } = useCart();

  // Escape closes the drawer, and the page behind it does not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const liveItems = cartItems.filter((item) => isCheckoutLive(item.pack.checkoutUrl));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 z-[9998] bg-[rgba(18,18,16,0.55)] backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[9999] flex w-full max-w-[430px] flex-col border-l border-[var(--rule)] bg-[var(--paper)] text-ink shadow-[-28px_0_60px_rgba(18,18,16,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-5">
              <div className="flex items-baseline gap-3">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink">
                  Cart
                </h2>
                <span className="font-mono text-[10px] tabular-nums text-rust">
                  {String(itemCount).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center border border-[var(--rule)] text-ink transition-colors hover:border-ink hover:bg-[rgba(18,18,16,0.04)]"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="font-display text-2xl text-ink">Nothing in the cart.</p>
                  <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-ink/60">
                    Every pack is one purchase, all platforms, free lifetime updates.
                  </p>
                  <Link
                    href="/store"
                    onClick={onClose}
                    className="link-rule mt-6"
                  >
                    Browse the store <span aria-hidden>→</span>
                  </Link>
                </div>
              ) : (
                <ul>
                  {cartItems.map((item, index) => (
                    <li
                      key={item.pack.id}
                      className="flex gap-4 border-b border-[var(--rule-soft)] py-5"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--rule)] bg-[rgba(255,253,246,0.6)] text-center">
                        <span className="px-1 font-mono text-[7.5px] uppercase leading-tight tracking-[0.08em] text-rust">
                          {item.pack.badge}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-lg leading-tight text-ink">
                          {item.pack.title}
                        </p>
                        <p className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] text-ink/60">
                          {item.pack.type} · × {item.qty}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-between">
                        <span className="font-mono text-[11px] tabular-nums text-ink">
                          ${(item.pack.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.pack.id)}
                          aria-label={`Remove ${item.pack.title}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--rule)] text-ink/60 transition-colors hover:border-rust hover:text-rust"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <span className="sr-only">Item {index + 1}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-[var(--rule)] px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/60">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl tabular-nums text-ink">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                {liveItems.length > 0 ? (
                  <div className="mt-5 space-y-2">
                    {liveItems.map((item) => (
                      <a
                        key={item.pack.id}
                        href={item.pack.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ink w-full"
                      >
                        {liveItems.length > 1
                          ? `Checkout · ${item.pack.title}`
                          : "Proceed to checkout"}
                        <span aria-hidden>→</span>
                      </a>
                    ))}
                    {liveItems.length < cartItems.length ? (
                      <p className="pt-1 font-mono text-[8px] uppercase leading-relaxed tracking-[0.18em] text-ink/60">
                        Packs with a closed checkout are bought by message.
                      </p>
                    ) : null}
                    {liveItems.length > 1 ? (
                      <p className="font-mono text-[8px] uppercase leading-relaxed tracking-[0.18em] text-ink/60">
                        One pack per checkout.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5">
                    <p className="text-sm leading-relaxed text-ink/70">
                      Card checkout is being switched on. Write to us and the pack
                      arrives the same day.
                    </p>
                    <Link
                      href="/contact#booking"
                      onClick={onClose}
                      className="btn btn-ink mt-4 w-full"
                    >
                      Message to order <span aria-hidden>→</span>
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-4 w-full font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink/60 transition-colors hover:text-rust"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
