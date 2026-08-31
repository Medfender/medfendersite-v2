"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import type { PackData } from "@/data/storeData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  pack: PackData;
  qty: number;
}

interface CartState {
  cartItems: CartItem[];
}

type CartAction =
  | { type: "ADD"; pack: PackData }
  | { type: "REMOVE"; packId: string }
  | { type: "CLEAR" };

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (pack: PackData) => void;
  removeFromCart: (packId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.cartItems.find((i) => i.pack.id === action.pack.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.pack.id === action.pack.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { cartItems: [...state.cartItems, { pack: action.pack, qty: 1 }] };
    }
    case "REMOVE":
      return {
        cartItems: state.cartItems.filter((i) => i.pack.id !== action.packId),
      };
    case "CLEAR":
      return { cartItems: [] };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] });

  const cartTotal = useMemo(
    () =>
      state.cartItems.reduce((sum, item) => sum + item.pack.price * item.qty, 0),
    [state.cartItems]
  );

  const itemCount = useMemo(
    () => state.cartItems.reduce((sum, item) => sum + item.qty, 0),
    [state.cartItems]
  );

  const addToCart = useCallback((pack: PackData) => {
    dispatch({ type: "ADD", pack });
  }, []);

  const removeFromCart = useCallback((packId: string) => {
    dispatch({ type: "REMOVE", packId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const value: CartContextValue = useMemo(
    () => ({ cartItems: state.cartItems, addToCart, removeFromCart, clearCart, cartTotal, itemCount }),
    [state.cartItems, addToCart, removeFromCart, clearCart, cartTotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
