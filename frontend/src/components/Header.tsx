"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Show, UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

interface UserData {
  _id: string;
  clerkId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | number;
  role?: string;
}

interface HeaderProps {
  leftNode?: React.ReactNode;
}

export default function Header({ leftNode }: HeaderProps = {}) {
  const { itemCount } = useCart();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { signOut } = useClerk();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<UserData | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // On mount, read saved preferences & check login
  useEffect(() => {
    const saved = localStorage.getItem("kgl-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }

    // Check if user is stored in localStorage
    const userData = localStorage.getItem("kgl-user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("kgl-user");
        localStorage.removeItem("kgl-token");
      }
    }

    // Check if we need to auto-open the cart
    const params = new URLSearchParams(window.location.search);
    if (params.get("openCart") === "true") {
      setIsCartOpen(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Sync Clerk authenticated user with MongoDB when loaded
  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (email) {
        fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            imageUrl: clerkUser.imageUrl || "",
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((dbUser) => {
            if (dbUser) {
              if (dbUser.token) localStorage.setItem("kgl-token", dbUser.token);
              localStorage.setItem("kgl-user", JSON.stringify(dbUser));
              setUser(dbUser);
            }
          })
          .catch((err) => console.warn("Background user sync notice:", err));
      }
    } else if (isClerkLoaded && !clerkUser) {
      // User signed out in Clerk -> clear localStorage user
      if (localStorage.getItem("kgl-user")) {
        localStorage.removeItem("kgl-user");
        localStorage.removeItem("kgl-token");
        setUser(null);
      }
    }
  }, [isClerkLoaded, clerkUser]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kgl-theme", next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    // Sync theme to backend if logged in
    if (user && user._id) {
      fetch(`/api/users/${user._id}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
    }
  };

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  return (
    <>
      <header className="site-header" id="site-header">
        <div className="header-left">
          {/* Logo */}
          <Link href="/" className="site-logo" aria-label="KGL Shades Home">
            <span className="logo-kgl">KGL</span>
            <span className="logo-shades">SHADES</span>
          </Link>
          {leftNode}
        </div>

        {/* Navigation */}
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/" className="nav-link">About</Link>
        </nav>

        {/* Controls */}
        <div className="header-controls">
          {/* Profile / Auth */}
          <Show when="signed-out">
            <Link href="/login" className="nav-auth-btn" id="header-sign-in-btn">
              Sign In
            </Link>
            <Link href="/signup" className="nav-auth-btn nav-auth-btn-primary" id="header-sign-up-btn">
              Sign Up
            </Link>
          </Show>

          <Show when="signed-in">
            <div className="profile-menu">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-full",
                  },
                }}
              />
            </div>
          </Show>

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
          <button
            className="cart-button"
            aria-label={`Cart: ${itemCount} items`}
            id="cart-button"
            onClick={handleCartOpen}
          >
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

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={handleCartClose} />
    </>
  );
}
