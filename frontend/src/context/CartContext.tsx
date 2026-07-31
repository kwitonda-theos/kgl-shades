"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { SunglassesProduct, LensOption, CartItem } from "@/types/product";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (product: SunglassesProduct, lens: LensOption) => void;
  removeFromCart: (productId: string, lensId: string) => void;
  updateQuantity: (productId: string, lensId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    try {
      const savedCart = localStorage.getItem("kgl-cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage and backend whenever items change
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("kgl-cart", JSON.stringify(items));

      // Sync to backend if logged in
      const userStr = localStorage.getItem("kgl-user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user._id) {
            // We use a debounce or just direct fetch. Since it's infrequent, direct fetch is okay
            fetch(`/api/users/${user._id}/preferences`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cart: items })
            }).catch(() => {}); // ignore network errors
          }
        } catch (e) {
          // invalid user JSON
        }
      }
    }
  }, [items, isInitialized]);

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

  const removeFromCart = useCallback((productId: string, lensId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedLens.id === lensId)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, lensId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove the item if quantity goes to 0 or below
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(item.product.id === productId && item.selectedLens.id === lensId)
          )
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.selectedLens.id === lensId
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

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

  // Avoid hydration mismatch by not rendering the context values until initialized
  // or return children normally but empty cart initially
  return (
    <CartContext.Provider
      value={{
        items: isInitialized ? items : [],
        itemCount: isInitialized ? itemCount : 0,
        cartTotal: isInitialized ? cartTotal : 0,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
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
