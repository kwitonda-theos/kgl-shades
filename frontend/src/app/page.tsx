"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { SunglassesProduct } from "@/types/product";
import { products as initialMockProducts } from "@/data/mockData";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import QuickCopDrawer from "@/components/QuickCopDrawer";

export default function HomePage() {
  const [products, setProducts] = useState<SunglassesProduct[]>(initialMockProducts);
  const [activeLifestyle, setActiveLifestyle] = useState<SunglassesProduct>(
    initialMockProducts[0]
  );
  const [drawerProduct, setDrawerProduct] = useState<SunglassesProduct | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileSelectedProduct, setMobileSelectedProduct] =
    useState<SunglassesProduct>(initialMockProducts[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mappedProducts: SunglassesProduct[] = data.map((p: any) => ({
              id: p._id,
              slug: p.name.toLowerCase().replace(/ /g, "-"),
              name: p.name,
              basePrice: p.basePrice,
              description: p.description || "Engineered for those who move in darkness",
              mainImage: p.mainImage,
              lifestyleImage: p.lifestyleImage,
              galleryImages: p.galleryImages || [p.mainImage],
              lensOptions: p.lensOption?.length > 0 ? p.lensOption.map((l: any) => ({
                id: l._id || l.name,
                name: l.name,
                description: l.description,
                priceUpcharge: l.priceUpcharge,
              })) : [{ id: "standard", name: "Standard", description: "Standard Lens", priceUpcharge: 0 }],
            }));
            setProducts(mappedProducts);
            setActiveLifestyle(mappedProducts[0]);
            setMobileSelectedProduct(mappedProducts[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (loading && products === initialMockProducts) {
    return (
      <>
        <Header />
        <main className="desktop-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading collection...</p>
        </main>
      </>
    );
  }

  if (!products || products.length === 0) {
    return (
      <>
        <Header />
        <main className="desktop-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>No products found.</p>
        </main>
      </>
    );
  }

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
