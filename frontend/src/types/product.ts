export interface LensOption {
  id: string;
  name: string;
  priceUpcharge: number;
  description: string;
}

export interface SunglassesProduct {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  description: string;
  mainImage: string;
  lifestyleImage: string;
  galleryImages: string[];
  lensOptions: LensOption[];
}

export interface CartItem {
  product: SunglassesProduct;
  selectedLens: LensOption;
  quantity: number;
}
