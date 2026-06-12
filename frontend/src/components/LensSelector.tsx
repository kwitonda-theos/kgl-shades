"use client";

import React, { useState } from "react";
import { LensOption, SunglassesProduct } from "@/types/product";

interface LensSelectorProps {
  product: SunglassesProduct;
  onLensSelect: (lens: LensOption) => void;
  selectedLensId?: string;
}

export default function LensSelector({
  product,
  onLensSelect,
  selectedLensId,
}: LensSelectorProps) {
  const [selected, setSelected] = useState<string>(
    selectedLensId || product.lensOptions[0]?.id || ""
  );

  const selectedLens =
    product.lensOptions.find((l) => l.id === selected) ||
    product.lensOptions[0];

  const totalPrice = product.basePrice + (selectedLens?.priceUpcharge || 0);

  const handleSelect = (lens: LensOption) => {
    setSelected(lens.id);
    onLensSelect(lens);
  };

  return (
    <div className="lens-selector">
      {/* Dynamic Price Display */}
      <div className="price-display">
        <span className="price-label">Total</span>
        <span className="price-value" key={totalPrice}>
          ${totalPrice}
        </span>
      </div>

      {/* Lens Options */}
      <div className="lens-options-label">Select Lens</div>
      <div className="lens-options-grid">
        {product.lensOptions.map((lens) => {
          const isSelected = lens.id === selected;
          return (
            <button
              key={lens.id}
              onClick={() => handleSelect(lens)}
              className={`lens-option-card ${isSelected ? "lens-option-card--selected" : ""}`}
            >
              <div className="lens-option-header">
                <div className="lens-radio">
                  <div
                    className={`lens-radio-dot ${isSelected ? "lens-radio-dot--active" : ""}`}
                  />
                </div>
                <span className="lens-option-name">{lens.name}</span>
                {lens.priceUpcharge > 0 && (
                  <span className="lens-upcharge">+${lens.priceUpcharge}</span>
                )}
                {lens.priceUpcharge === 0 && (
                  <span className="lens-included">Included</span>
                )}
              </div>
              <p className="lens-option-desc">{lens.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
