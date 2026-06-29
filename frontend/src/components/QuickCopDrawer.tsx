"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { SunglassesProduct, LensOption } from "@/types/product";
import { useCart } from "@/context/CartContext";
import LensSelector from "./LensSelector";

interface QuickCopDrawerProps {
  product: SunglassesProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCopDrawer({
  product,
  isOpen,
  onClose,
}: QuickCopDrawerProps) {
  const { addToCart } = useCart();
  const [selectedLens, setSelectedLens] = useState<LensOption | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Reset lens selection when product changes
  useEffect(() => {
    if (product) {
      setSelectedLens(product.lensOptions[0] || null);
    }
  }, [product]);

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

  const handleAddToCart = useCallback(() => {
    if (product && selectedLens) {
      addToCart(product, selectedLens);
      setAddedFeedback(true);
      setTimeout(() => {
        setAddedFeedback(false);
        onClose();
      }, 1200);
    }
  }, [product, selectedLens, addToCart, onClose]);

  const totalPrice =
    product && selectedLens
      ? product.basePrice + selectedLens.priceUpcharge
      : product?.basePrice || 0;

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? "drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop Drawer — slides from right */}
      <div
        className={`drawer drawer--desktop ${isOpen ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${product.name}`}
      >
        <div className="drawer-content">
          {/* Close Button */}
          <button onClick={onClose} className="drawer-close" aria-label="Close drawer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Product Image */}
          <div className="drawer-image-wrapper">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="drawer-image"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
          </div>

          {/* Product Info */}
          <div className="drawer-product-info">
            <h2 className="drawer-product-name">{product.name}</h2>
            <p className="drawer-product-desc">{product.description}</p>
          </div>

          {/* Lens Selector */}
          <LensSelector
            product={product}
            onLensSelect={setSelectedLens}
            selectedLensId={selectedLens?.id}
          />

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`drawer-cta ${addedFeedback ? "drawer-cta--success" : ""}`}
          >
            {addedFeedback ? (
              <span className="drawer-cta-feedback">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 10l4 4 8-8" />
                </svg>
                Added to Cart
              </span>
            ) : (
              <span>ADD TO CART — FRW {totalPrice}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer — slides from bottom */}
      <div
        className={`drawer drawer--mobile ${isOpen ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${product.name}`}
      >
        <div className="drawer-content">
          {/* Drag Handle */}
          <div className="drawer-handle" onClick={onClose}>
            <div className="drawer-handle-bar" />
          </div>

          {/* Product Header */}
          <div className="drawer-mobile-header">
            <div className="drawer-mobile-thumb-wrapper">
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className="drawer-mobile-thumb"
                sizes="80px"
              />
            </div>
            <div>
              <h2 className="drawer-product-name">{product.name}</h2>
              <p className="drawer-mobile-price">FRW {product.basePrice}</p>
            </div>
          </div>

          {/* Lens Selector */}
          <LensSelector
            product={product}
            onLensSelect={setSelectedLens}
            selectedLensId={selectedLens?.id}
          />

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`drawer-cta ${addedFeedback ? "drawer-cta--success" : ""}`}
          >
            {addedFeedback ? (
              <span className="drawer-cta-feedback">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 10l4 4 8-8" />
                </svg>
                Added to Cart
              </span>
            ) : (
              <span>ADD TO CART — FRW {totalPrice}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
