"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { SunglassesProduct, LensOption, CartItem } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (product: SunglassesProduct, lens: LensOption) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (product: SunglassesProduct, lens: LensOption) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedLens.id === lens.id
        );
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id &&
            item.selectedLens.id === lens.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, selectedLens: lens, quantity: 1 }];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = items.reduce(
    (sum, item) =>
      sum +
      (item.product.basePrice + item.selectedLens.priceUpcharge) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, cartTotal, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
