"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import s from "./login.module.css";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid email or password");

            // ── MERGE CARTS ──
            const localCartRaw = localStorage.getItem("kgl-cart");
            let dbCart = data.cart || [];

            if (dbCart.length > 0) {
              dbCart = dbCart.map((item: any) => ({
                product: {
                  ...item.product,
                  id: item.product?._id || item.product?.id || item.product,
                },
                selectedLens: item.selectedLens,
                quantity: item.quantity,
              }));
            }

            let mergedCart = [...dbCart];

            if (localCartRaw) {
              try {
                const localCart = JSON.parse(localCartRaw);
                localCart.forEach((localItem: any) => {
                  const exists = mergedCart.find(
                    (dbItem: any) =>
                      dbItem.product?.id === localItem.product?.id &&
                      dbItem.selectedLens?.id === localItem.selectedLens?.id
                  );
                  if (!exists) {
                    mergedCart.push(localItem);
                  }
                });
              } catch (e) {
                console.error("Cart merge failed", e);
              }
            }

            localStorage.setItem("kgl-cart", JSON.stringify(mergedCart));

            // ── APPLY THEME ──
            if (data.theme) {
              localStorage.setItem("kgl-theme", data.theme);
              if (data.theme === "light") {
                document.documentElement.setAttribute("data-theme", "light");
              } else {
                document.documentElement.removeAttribute("data-theme");
              }
            }

            if (data.token) localStorage.setItem("kgl-token", data.token);
            localStorage.setItem(
              "kgl-user",
              JSON.stringify({
                _id: data._id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role,
              })
            );

            // Sync merged cart back to MongoDB
            if (data._id) {
              fetch(`/api/users/${data._id}/preferences`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart: mergedCart }),
              }).catch(() => {});
            }
        if (redirectTo === "checkout") {
          window.location.href = "/?openCart=true";
        } else {
          window.location.href = "/";
        }
    } catch (err: any) {
      console.error("Login error:", err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Invalid email or password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.page}>
      {/* Go Back Button */}
      <Link href="/" className={s.backButton} aria-label="Go back to Home">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </Link>

      <div className={s.container}>
        {/* Logo */}
        <Link href="/" className={s.logo} aria-label="Back to KGL Shades">
          <span className={s.logoMain}>KGL</span>
          <span className={s.logoSub}>SHADES</span>
        </Link>

        {/* Card */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h1 className={s.title}>Welcome Back</h1>
            <p className={s.subtitle}>
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={s.error} id="login-error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form} id="login-form">
            {/* Email Field */}
            <div className={s.field}>
              <label htmlFor="login-email" className={s.label}>
                Email Address
              </label>
              <div className={s.inputWrapper}>
                <svg
                  className={s.inputIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  id="login-email"
                  className={s.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={s.field}>
              <div className={s.labelRow}>
                <label htmlFor="login-password" className={s.label}>
                  Password
                </label>
                <a href="#" className={s.forgotLink}>
                  Forgot?
                </a>
              </div>
              <div className={s.inputWrapper}>
                <svg
                  className={s.inputIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  className={s.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={s.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={s.submit}
              disabled={isLoading}
              id="login-submit"
            >
              {isLoading ? <span className={s.spinner} /> : "Sign In"}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className={s.footer}>
          Don&apos;t have an account?{" "}
          <Link href={`/signup${redirectTo ? `?redirect=${redirectTo}` : ""}`} className={s.footerLink}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
