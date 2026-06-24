"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, itemCount, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem("kgl-token");
    if (!token) {
      // Redirect to login with a redirect param
      window.location.href = "/login?redirect=checkout";
      return;
    }

    // User is logged in — place the order
    placeOrder(token);
  };

  const placeOrder = async (token: string) => {
    try {
      const orderItems = items.map((item) => ({
        product: item.product.id,
        lensOptionId: item.selectedLens.id,
        quantity: item.quantity,
      }));

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: cartTotal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to place order");
        return;
      }

      // Order placed successfully
      clearCart();
      onClose();
      alert("Order placed successfully! ");
    } catch {
      alert("Something went wrong placing your order. Please try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? "drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
        style={{ zIndex: 200 }}
      />

      {/* Desktop Cart Drawer — slides from right */}
      <div
        className={`drawer drawer--desktop ${isOpen ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        style={{ zIndex: 210 }}
      >
        <div className="drawer-content">
          {/* Close Button */}
          <button onClick={onClose} className="drawer-close" aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Cart Header */}
          <div className="cart-drawer-header">
            <h2 className="cart-drawer-title">YOUR BAG</h2>
            <span className="cart-drawer-count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Cart Items or Empty State */}
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cart-empty-title">Your bag is empty</p>
              <p className="cart-empty-sub">
                Explore the collection and add something fire.
              </p>
              <button className="cart-empty-cta" onClick={onClose}>
                BROWSE COLLECTION
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="cart-drawer-items">
                {items.map((item) => {
                  const lineTotal =
                    (item.product.basePrice + item.selectedLens.priceUpcharge) *
                    item.quantity;
                  return (
                    <div
                      className="cart-drawer-item"
                      key={`${item.product.id}-${item.selectedLens.id}`}
                    >
                      {/* Product Thumbnail */}
                      <div className="cart-item-image">
                        <Image
                          src={item.product.mainImage}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <p className="cart-item-name">{item.product.name}</p>
                            <p className="cart-item-lens">
                              {item.selectedLens.name} Lens
                              {item.selectedLens.priceUpcharge > 0 &&
                                ` (+$${item.selectedLens.priceUpcharge})`}
                            </p>
                          </div>
                          <button
                            className="cart-item-remove"
                            onClick={() =>
                              removeFromCart(
                                item.product.id,
                                item.selectedLens.id
                              )
                            }
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          {/* Quantity Controls */}
                          <div className="cart-item-quantity">
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedLens.id,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="cart-qty-value">
                              {item.quantity}
                            </span>
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedLens.id,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <p className="cart-item-total">${lineTotal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="cart-drawer-footer">
                <div className="cart-footer-row">
                  <span className="cart-footer-label">Subtotal</span>
                  <span className="cart-footer-value">${cartTotal}</span>
                </div>
                <p className="cart-footer-note">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  id="checkout-button"
                >
                  CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Cart Drawer — slides from bottom */}
      <div
        className={`drawer drawer--mobile ${isOpen ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        style={{ zIndex: 210 }}
      >
        <div className="drawer-content">
          {/* Drag Handle */}
          <div className="drawer-handle" onClick={onClose}>
            <div className="drawer-handle-bar" />
          </div>

          {/* Cart Header */}
          <div className="cart-drawer-header">
            <h2 className="cart-drawer-title">YOUR BAG</h2>
            <span className="cart-drawer-count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Cart Items or Empty State */}
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cart-empty-title">Your bag is empty</p>
              <p className="cart-empty-sub">
                Explore the collection and add something fire.
              </p>
              <button className="cart-empty-cta" onClick={onClose}>
                BROWSE COLLECTION
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="cart-drawer-items">
                {items.map((item) => {
                  const lineTotal =
                    (item.product.basePrice + item.selectedLens.priceUpcharge) *
                    item.quantity;
                  return (
                    <div
                      className="cart-drawer-item"
                      key={`${item.product.id}-${item.selectedLens.id}`}
                    >
                      <div className="cart-item-image">
                        <Image
                          src={item.product.mainImage}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <p className="cart-item-name">{item.product.name}</p>
                            <p className="cart-item-lens">
                              {item.selectedLens.name} Lens
                              {item.selectedLens.priceUpcharge > 0 &&
                                ` (+$${item.selectedLens.priceUpcharge})`}
                            </p>
                          </div>
                          <button
                            className="cart-item-remove"
                            onClick={() =>
                              removeFromCart(
                                item.product.id,
                                item.selectedLens.id
                              )
                            }
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          <div className="cart-item-quantity">
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedLens.id,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="cart-qty-value">
                              {item.quantity}
                            </span>
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedLens.id,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <p className="cart-item-total">${lineTotal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="cart-drawer-footer">
                <div className="cart-footer-row">
                  <span className="cart-footer-label">Subtotal</span>
                  <span className="cart-footer-value">${cartTotal}</span>
                </div>
                <p className="cart-footer-note">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  id="checkout-button-mobile"
                >
                  CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
