"use client";

import React from "react";
import Image from "next/image";
import { SunglassesProduct } from "@/types/product";

interface ProductCardProps {
  product: SunglassesProduct;
  onClick: (product: SunglassesProduct) => void;
  onHover: (product: SunglassesProduct) => void;
  index: number;
}

export default function ProductCard({
  product,
  onClick,
  onHover,
  index,
}: ProductCardProps) {
  return (
    <button
      className="product-card"
      onClick={() => onClick(product)}
      onMouseEnter={() => onHover(product)}
      style={{ animationDelay: `${index * 100}ms` }}
      aria-label={`View ${product.name} — $${product.basePrice}`}
    >
      {/* Image Container */}
      <div className="product-card-image-wrapper">
        <Image
          src={product.mainImage}
          alt={product.name}
          fill
          className="product-card-image"
          sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
          priority={index < 2}
        />

        {/* Hover Overlay */}
        <div className="product-card-overlay">
          <span className="product-card-cta-text">CONFIGURE</span>
        </div>
      </div>

      {/* Info Bar */}
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <span className="product-card-price">${product.basePrice}</span>
      </div>
    </button>
  );
}
