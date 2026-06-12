"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="site-header" id="site-header">
      {/* Logo */}
      <a href="/" className="site-logo" aria-label="KGL Shades Home">
        <span className="logo-kgl">KGL</span>
        <span className="logo-shades">SHADES</span>
      </a>

      {/* Navigation */}
      <nav className="site-nav" aria-label="Main navigation">
        <a href="/" className="nav-link">Collection</a>
        <a href="/" className="nav-link">About</a>
      </nav>

      {/* Cart */}
      <button className="cart-button" aria-label={`Cart: ${itemCount} items`} id="cart-button">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {itemCount > 0 && (
          <span className="cart-badge" key={itemCount}>
            {itemCount}
          </span>
        )}
      </button>
    </header>
  );
}
