"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { SunglassesProduct } from "@/types/product";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import QuickCopDrawer from "@/components/QuickCopDrawer";

interface RawProduct {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  mainImage: string;
  lifestyleImage?: string;
  lensOption?: Array<{
    _id?: string;
    name: string;
    description: string;
    priceUpcharge: number;
  }>;
}

interface RawCollection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  products: RawProduct[];
  createdAt: string;
}

function mapProduct(p: RawProduct): SunglassesProduct {
  return {
    id: p._id,
    slug: p.name.toLowerCase().replace(/ /g, "-"),
    name: p.name,
    basePrice: p.basePrice,
    description: p.description || "Engineered for those who move in darkness",
    mainImage: p.mainImage,
    lifestyleImage: p.lifestyleImage || p.mainImage,
    galleryImages: [p.mainImage],
    lensOptions:
      p.lensOption && p.lensOption.length > 0
        ? p.lensOption.map((l) => ({
            id: l._id || l.name,
            name: l.name,
            description: l.description,
            priceUpcharge: l.priceUpcharge,
          }))
        : [
            {
              id: "standard",
              name: "Standard",
              description: "Standard Lens",
              priceUpcharge: 0,
            },
          ],
  };
}

export default function HomePage() {
  const [collections, setCollections] = useState<RawCollection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<RawCollection | null>(null);
  const [products, setProducts] = useState<SunglassesProduct[]>([]);
  const [activeLifestyle, setActiveLifestyle] =
    useState<SunglassesProduct | null>(null);
  const [drawerProduct, setDrawerProduct] =
    useState<SunglassesProduct | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileSelectedProduct, setMobileSelectedProduct] =
    useState<SunglassesProduct | null>(null);
  const [loading, setLoading] = useState(true);
  // Track active collection cover for hover effect on picker
  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/collections");
        if (res.ok) {
          const data: RawCollection[] = await res.json();
          setCollections(data);
        }
      } catch (err) {
        console.error("Failed to fetch collections", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const handleSelectCollection = useCallback((col: RawCollection) => {
    const mapped = col.products.map(mapProduct);
    setSelectedCollection(col);
    setProducts(mapped);
    setActiveLifestyle(mapped[0] ?? null);
    setMobileSelectedProduct(mapped[0] ?? null);
  }, []);

  const handleBackToPicker = useCallback(() => {
    setSelectedCollection(null);
    setProducts([]);
    setActiveLifestyle(null);
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
    if (mobileSelectedProduct) {
      setDrawerProduct(mobileSelectedProduct);
      setIsDrawerOpen(true);
    }
  }, [mobileSelectedProduct]);

  // ─── LOADING ────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <div className="collection-picker-loading">
          <div className="collection-picker-spinner" />
          <p>Loading collections…</p>
        </div>
      </>
    );
  }

  // ─── COLLECTION PICKER ──────────────────────────────────────
  if (!selectedCollection) {
    return (
      <>
        <Header />
        <main className="collection-picker" id="collection-picker">
          <div className="collection-picker-hero">
            <h1 className="collection-picker-title">THE COLLECTIONS</h1>
            <p className="collection-picker-sub">
              Choose your world
            </p>
          </div>

          {collections.length === 0 ? (
            <div className="collection-picker-empty">
              <p>No collections yet. Check back soon.</p>
            </div>
          ) : (
            <div className="collection-grid">
              {collections.map((col) => {
                // Resolve cover image: explicit upload → first product lifestyle → first product main
                const rawFirstProduct = col.products[0] as any;
                const cover =
                  col.coverImage ||
                  rawFirstProduct?.lifestyleImage ||
                  rawFirstProduct?.mainImage ||
                  "";
                const isHovered = hoveredCollectionId === col._id;

                return (
                  <button
                    key={col._id}
                    className={`collection-card ${isHovered ? "collection-card--hovered" : ""}`}
                    onClick={() => handleSelectCollection(col)}
                    onMouseEnter={() => setHoveredCollectionId(col._id)}
                    onMouseLeave={() => setHoveredCollectionId(null)}
                    id={`collection-${col.slug}`}
                  >
                    {/* Background Image */}
                    <div className="collection-card-image-wrapper">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={col.name}
                          fill
                          className="collection-card-image"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="collection-card-no-image" />
                      )}
                    </div>

                    {/* Gradient overlay + text */}
                    <div className="collection-card-overlay">
                      <div className="collection-card-content">
                        <p className="collection-card-count">
                          {col.products.length}{" "}
                          {col.products.length === 1 ? "STYLE" : "STYLES"}
                        </p>
                        <h2 className="collection-card-name">{col.name}</h2>
                        {col.description && (
                          <p className="collection-card-desc">
                            {col.description}
                          </p>
                        )}
                        <span className="collection-card-cta">
                          ENTER COLLECTION
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </>
    );
  }

  // ─── BROWSE VIEW (existing split-screen) ─────────────────────
  return (
    <>
      <Header />

      {/* Back breadcrumb */}
      <div className="collection-breadcrumb">
        <button
          className="collection-back-btn"
          onClick={handleBackToPicker}
          id="back-to-collections"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Collections
        </button>
        <span className="collection-breadcrumb-sep">›</span>
        <span className="collection-breadcrumb-current">
          {selectedCollection.name}
        </span>
      </div>

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
                activeLifestyle?.id === product.id
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
                priority={product.id === products[0]?.id}
              />
            </div>
          ))}

          {/* Overlay Text on Lifestyle Image */}
          <div className="lifestyle-overlay">
            <p className="lifestyle-tagline" key={activeLifestyle?.id}>
              {activeLifestyle?.name}
            </p>
            <p className="lifestyle-sub">
              Starting at FRW {activeLifestyle?.basePrice}
            </p>
          </div>
        </div>

        {/* Right — Scrollable Product Grid */}
        <div className="desktop-right">
          <div className="desktop-grid-header">
            <h1 className="collection-title">{selectedCollection.name}</h1>
            <p className="collection-subtitle">
              {selectedCollection.description ||
                "Engineered for those who move in darkness"}
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
