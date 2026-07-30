"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/context/CartContext";

type CheckoutStep = "phone" | "pending" | "success" | "failed";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("phone");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [txRef, setTxRef] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setError("");
      setTxRef(null);
      pollCountRef.current = 0;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen]);

  // Lock body scroll
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

  // Poll for payment status
  const startPolling = useCallback(
    (ref: string) => {
      pollCountRef.current = 0;
      pollRef.current = setInterval(async () => {
        pollCountRef.current += 1;

        // Stop polling after 60 attempts (3 minutes)
        if (pollCountRef.current > 60) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("failed");
          setError("Payment timed out. Please try again.");
          return;
        }

        try {
          const res = await fetch(`/api/payments/verify/${ref}`);
          const data = await res.json();

          if (data.status === "paid") {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("success");
            clearCart();
            setTimeout(() => {
              onSuccess();
            }, 2500);
          } else if (data.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep("failed");
            setError("Payment was declined. Please try again.");
          }
        } catch {
          // Keep polling on network errors
        }
      }, 3000);
    },
    [clearCart, onSuccess]
  );

  const handlePay = async () => {
    setError("");

    // Basic phone validation for Rwanda numbers
    const cleanPhone = phone.replace(/\s/g, "");
    if (!/^(07[2-9]\d{7}|2507[2-9]\d{7})$/.test(cleanPhone)) {
      setError("Enter a valid Rwandan phone number (e.g. 078XXXXXXX)");
      return;
    }

    // Get user data
    const token = localStorage.getItem("kgl-token");
    const userData = localStorage.getItem("kgl-user");
    if (!token || !userData) {
      setError("You must be logged in to checkout.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch {
      setError("Invalid user session. Please log in again.");
      return;
    }

    // Format phone: ensure it starts with 250
    const formattedPhone = cleanPhone.startsWith("250")
      ? cleanPhone
      : `250${cleanPhone}`;

    const orderItems = items.map((item) => ({
      product: item.product.id,
      lensOptionId: item.selectedLens.id,
      quantity: item.quantity,
    }));

    setStep("pending");

    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: cartTotal,
          phone: formattedPhone,
          user: user._id,
          email: user.email,
          fullname: `${user.firstName} ${user.lastName}`.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "failed") {
        setStep("phone");
        setError(data.message || "Failed to initiate payment");
        return;
      }

      // Payment initiated — start polling
      setTxRef(data.txRef);
      startPolling(data.txRef);
    } catch {
      setStep("phone");
      setError("Network error. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="checkout-backdrop"
        onClick={() => {
          if (step === "phone" || step === "failed") onClose();
        }}
      />

      {/* Modal */}
      <div className="checkout-modal">
        {/* ── STEP 1: Phone Input ── */}
        {step === "phone" && (
          <div className="checkout-step">
            <button className="checkout-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="checkout-header">
              <div className="checkout-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h2 className="checkout-title">Mobile Money</h2>
              <p className="checkout-subtitle">
                Pay with MTN MoMo or Airtel Money
              </p>
            </div>

            {/* Order Summary */}
            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
                <span className="checkout-summary-total">FRW {cartTotal}</span>
              </div>
            </div>

            {/* Phone Input */}
            <div className="checkout-form">
              <label className="checkout-label">Phone Number</label>
              <div className="checkout-phone-input">
                <span className="checkout-phone-prefix">+250</span>
                <input
                  type="tel"
                  className="checkout-input"
                  placeholder="78 XXX XXXX"
                  value={phone.startsWith("250") ? phone.slice(3) : phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPhone(val);
                  }}
                  maxLength={10}
                  autoFocus
                />
              </div>
              <p className="checkout-hint">
                You&apos;ll receive a payment prompt on this number
              </p>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button className="checkout-pay-btn" onClick={handlePay}>
              PAY FRW {cartTotal}
            </button>
          </div>
        )}

        {/* ── STEP 2: Pending — Waiting for user to approve on phone ── */}
        {step === "pending" && (
          <div className="checkout-step checkout-step--pending">
            <div className="checkout-pending-icon">
              <div className="checkout-spinner" />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="checkout-phone-svg">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <h2 className="checkout-title">Check Your Phone</h2>
            <p className="checkout-subtitle">
              Approve the payment of <strong>FRW {cartTotal}</strong> on your mobile money.
            </p>
            <p className="checkout-pending-hint">
              Enter your Mobile Money PIN when prompted
            </p>
            {txRef && (
              <p className="checkout-txref">Ref: {txRef}</p>
            )}
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "success" && (
          <div className="checkout-step checkout-step--success">
            <div className="checkout-success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="24" cy="24" r="20" />
                <path d="M15 24l6 6 12-12" />
              </svg>
            </div>
            <h2 className="checkout-title">Payment Successful!</h2>
            <p className="checkout-subtitle">
              Your order has been confirmed. We&apos;ll start preparing it right away.
            </p>
          </div>
        )}

        {/* ── STEP 4: Failed ── */}
        {step === "failed" && (
          <div className="checkout-step checkout-step--failed">
            <div className="checkout-failed-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="24" cy="24" r="20" />
                <path d="M18 18l12 12M30 18L18 30" />
              </svg>
            </div>
            <h2 className="checkout-title">Payment Failed</h2>
            <p className="checkout-subtitle">
              {error || "Something went wrong. Please try again."}
            </p>
            <button
              className="checkout-retry-btn"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
            >
              TRY AGAIN
            </button>
            <button className="checkout-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
