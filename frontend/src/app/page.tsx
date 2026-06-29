"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { SunglassesProduct } from "@/types/product";
import { products } from "@/data/mockData";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import QuickCopDrawer from "@/components/QuickCopDrawer";

export default function HomePage() {
  const [activeLifestyle, setActiveLifestyle] = useState<SunglassesProduct>(
    products[0]
  );
  const [drawerProduct, setDrawerProduct] = useState<SunglassesProduct | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileSelectedProduct, setMobileSelectedProduct] =
    useState<SunglassesProduct>(products[0]);

  const handleProductHover = useCallback((product: SunglassesProduct) => {
    setActiveLifestyle(product);
  }, []);

  const handleProductClick = useCallback((product: SunglassesProduct) => {
    setDrawerProduct(product);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setDrawerProduct(null), 300);
  }, []);

  const handleMobileQuickCop = useCallback(() => {
    setDrawerProduct(mobileSelectedProduct);
    setIsDrawerOpen(true);
  }, [mobileSelectedProduct]);

  return (
    <>
      <Header />

      {/* ═══════════════════════════════════════════════
          DESKTOP LAYOUT — Split-Screen Street
          ═══════════════════════════════════════════════ */}
      <main className="desktop-layout" id="desktop-layout">
        {/* Left — Sticky Lifestyle Image */}
        <div className="desktop-left">
          {products.map((product) => (
            <div
              key={product.id}
              className={`lifestyle-image-layer ${
                activeLifestyle.id === product.id
                  ? "lifestyle-image-layer--active"
                  : ""
              }`}
            >
              <Image
                src={product.lifestyleImage}
                alt={`${product.name} lifestyle`}
                fill
                className="lifestyle-image"
                sizes="50vw"
                priority={product.id === products[0].id}
              />
            </div>
          ))}

          {/* Overlay Text on Lifestyle Image */}
          <div className="lifestyle-overlay">
            <p className="lifestyle-tagline" key={activeLifestyle.id}>
              {activeLifestyle.name}
            </p>
            <p className="lifestyle-sub">
              Starting at FRW {activeLifestyle.basePrice}
            </p>
          </div>
        </div>

        {/* Right — Scrollable Product Grid */}
        <div className="desktop-right">
          <div className="desktop-grid-header">
            <h1 className="collection-title">THE COLLECTION</h1>
            <p className="collection-subtitle">
              Engineered for those who move in darkness
            </p>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
                onHover={handleProductHover}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════
          MOBILE LAYOUT — Swipe-to-Hype Feed
          ═══════════════════════════════════════════════ */}
      <main className="mobile-layout" id="mobile-layout">
        <div className="mobile-feed">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="mobile-feed-item"
              onClick={() => {
                setMobileSelectedProduct(product);
                handleProductClick(product);
              }}
            >
              {/* Full-screen image */}
              <div className="mobile-feed-image-wrapper">
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  className="mobile-feed-image"
                  sizes="100vw"
                  priority={index < 2}
                />
              </div>

              {/* Bottom gradient info */}
              <div className="mobile-feed-info">
                <h2 className="mobile-feed-name">{product.name}</h2>
                <p className="mobile-feed-price">FRW {product.basePrice}</p>
                <p className="mobile-feed-desc">{product.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Persistent Quick-Cop Button */}
        <button
          className="quick-cop-button"
          onClick={handleMobileQuickCop}
          id="quick-cop-button"
        >
          <span className="quick-cop-text">QUICK COP</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </main>

      {/* Shared Drawer */}
      <QuickCopDrawer
        product={drawerProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}
