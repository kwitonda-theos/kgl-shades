"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { itemCount } = useCart();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // On mount, read saved preference
  useEffect(() => {
    const saved = localStorage.getItem("kgl-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kgl-theme", next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

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

      {/* Controls */}
      <div className="header-controls">
        {/* Profile */}
        <a href="/login" className="profile-button" aria-label="Go to Profile/Auth">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </a>

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          id="theme-toggle-button"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <span className="theme-toggle-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </span>
        </button>

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
      </div>
    </header>
  );
}
