"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/CartContext";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { cartItems, removeFromCart, cartTotal, itemCount, clearCart } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
          />
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[9999] w-full max-w-md bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border-l-2 border-zinc-800 shadow-[-30px_0_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-cyan-400" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Cart
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-700 rounded-full px-2 py-0.5">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 font-mono text-xs tracking-widest uppercase">
                  Your cart is empty.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.pack.id}
                    className="flex gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.15em] text-center leading-none">
                        {item.pack.badge}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-extrabold text-white truncate tracking-tight">
                        {item.pack.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-amber-400 tracking-tight">
                          ${item.pack.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">× {item.qty}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {item.pack.type}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.pack.id)}
                      aria-label={`Remove ${item.pack.title}`}
                      className="self-start p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-800 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-6 py-5 border-t border-zinc-800 bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Subtotal</span>
                  <span className="text-2xl font-black text-tamber-400 tracking-tight">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <a
                  href={cartItems[0]?.pack.checkoutUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-600 text-slate-950 font-black uppercase tracking-[0.15em] text-base px-6 py-4 shadow-[0_0_30px_rgba(0,216,246,0.3),inset_0_2px_4px_rgba(255,255,255,0.6)] hover:shadow-[0_0_50px_rgba(0,216,246,0.5)] transition-all active:translate-y-[1px] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)]"
                >
                  Proceed to Checkout (Lemon Squeezy)
                </a>
                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
