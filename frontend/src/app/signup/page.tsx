"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs/legacy";
import s from "./signup.module.css";

function SignupForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Verification state for email code/OTP
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Helper to sync user to MongoDB and set local session
  const syncAndRedirect = async (userId: string | null | undefined, userEmail: string, fName: string, lName: string, userPhone: string) => {
    try {
      const localTheme = localStorage.getItem("kgl-theme") || "dark";
      const localCartRaw = localStorage.getItem("kgl-cart");

      let localCart = [];
      if (localCartRaw) {
        try {
          localCart = JSON.parse(localCartRaw);
        } catch {
          // ignore
        }
      }

      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: userId,
          email: userEmail,
          firstName: fName,
          lastName: lName,
          phone: userPhone,
          theme: localTheme,
          cart: localCart,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem("kgl-token", data.token);
        localStorage.setItem(
          "kgl-user",
          JSON.stringify({
            _id: data._id,
            clerkId: data.clerkId || userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
          })
        );
      }
    } catch (e) {
      console.warn("User sync to DB completed with warning:", e);
    }

    if (redirectTo === "checkout") {
      window.location.href = "/?openCart=true";
    } else {
      window.location.href = "/";
    }
  };

  // Submit initial signup info to Clerk
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded || !signUp) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the user on Clerk using Clerk's SDK
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          phone: phone.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });

      // 2. Check if sign up is complete or requires email verification
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncAndRedirect(result.createdUserId, email, firstName, lastName, phone);
      } else {
        // Send email OTP code
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifying(true);
      }
    } catch (err: any) {
      console.error("Clerk signup error:", err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Registration failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP Verification Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded || !signUp) {
      return;
    }

    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        await syncAndRedirect(
          completeSignUp.createdUserId,
          email,
          firstName,
          lastName,
          phone
        );
      } else {
        setError("Verification incomplete. Please check the code and try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Verification failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Signup
  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectTo === "checkout" ? "/?openCart=true" : "/",
      });
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      setError(
        err.errors?.[0]?.message || err.message || "Google registration failed"
      );
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
          {!verifying ? (
            <>
              <div className={s.cardHeader}>
                <h1 className={s.title}>Create Account</h1>
                <p className={s.subtitle}>
                  Join KGL Shades and discover premium eyewear
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className={s.error} id="signup-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={s.form} id="signup-form">
                {/* First & Last Name — side by side */}
                <div className={s.fieldRow}>
                  <div className={s.field}>
                    <label htmlFor="signup-first-name" className={s.label}>
                      First Name
                    </label>
                    <div className={s.inputWrapper}>
                      <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        id="signup-first-name"
                        className={s.input}
                        placeholder="First"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className={s.field}>
                    <label htmlFor="signup-last-name" className={s.label}>
                      Last Name
                    </label>
                    <div className={s.inputWrapper}>
                      <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        id="signup-last-name"
                        className={s.input}
                        placeholder="Last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className={s.field}>
                  <label htmlFor="signup-email" className={s.label}>
                    Email Address
                  </label>
                  <div className={s.inputWrapper}>
                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      id="signup-email"
                      className={s.input}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className={s.field}>
                  <label htmlFor="signup-phone" className={s.label}>
                    Phone Number
                  </label>
                  <div className={s.inputWrapper}>
                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      id="signup-phone"
                      className={s.input}
                      placeholder="0781234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={s.field}>
                  <label htmlFor="signup-password" className={s.label}>
                    Password
                  </label>
                  <div className={s.inputWrapper}>
                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      className={s.input}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className={s.field}>
                  <label htmlFor="signup-confirm-password" className={s.label}>
                    Confirm Password
                  </label>
                  <div className={s.inputWrapper}>
                    <svg className={s.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-confirm-password"
                      className={s.input}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Terms */}
                <p className={s.terms}>
                  By creating an account, you agree to our{" "}
                  <a href="#" className={s.termsLink}>Terms of Service</a> and{" "}
                  <a href="#" className={s.termsLink}>Privacy Policy</a>
                </p>

                {/* Clerk CAPTCHA Container */}
                <div id="clerk-captcha" style={{ display: "flex", justifyContent: "center", margin: "8px 0" }} />

                {/* Submit */}
                <button
                  type="submit"
                  className={s.submit}
                  disabled={isLoading || !isLoaded}
                  id="signup-submit"
                >
                  {isLoading ? <span className={s.spinner} /> : "Create Account"}
                </button>
              </form>

              {/* Divider */}
              <div className={s.divider}>
                <span className={s.dividerText}>or</span>
              </div>

              {/* Google Signup */}
              <button
                className={s.socialBtn}
                id="google-signup"
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading || !isLoaded}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          ) : (
            <>
              {/* Verification Step */}
              <div className={s.cardHeader}>
                <h1 className={s.title}>Verify Email</h1>
                <p className={s.subtitle}>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className={s.error} id="verify-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className={s.form} id="verify-form">
                <div className={s.field}>
                  <label htmlFor="verify-code" className={s.label}>
                    Verification Code
                  </label>
                  <div className={s.inputWrapper}>
                    <input
                      type="text"
                      id="verify-code"
                      className={s.input}
                      style={{ paddingLeft: "16px", letterSpacing: "0.25em", textAlign: "center", fontSize: "18px", fontWeight: "600" }}
                      placeholder="••••••"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={s.submit}
                  disabled={isLoading || !isLoaded}
                  id="verify-submit"
                >
                  {isLoading ? <span className={s.spinner} /> : "Verify & Complete"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className={s.footer}>
          Already have an account?{" "}
          <Link href={`/login${redirectTo ? `?redirect=${redirectTo}` : ""}`} className={s.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
