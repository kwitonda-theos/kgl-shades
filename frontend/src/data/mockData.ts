import { SunglassesProduct, LensOption } from "@/types/product";

const sharedLensOptions: LensOption[] = [
  {
    id: "lens-standard",
    name: "Standard",
    priceUpcharge: 0,
    description: "Classic UV400 protection with crystal-clear optics.",
  },
  {
    id: "lens-blue-cut",
    name: "Blue Cut",
    priceUpcharge: 35,
    description:
      "Anti-blue-light coating that blocks HEV rays — perfect for screens and sunlight.",
  },
  {
    id: "lens-black-tint",
    name: "Black Tint",
    priceUpcharge: 25,
    description:
      "Deep smoke tint for maximum glare reduction and a murdered-out look.",
  },
  {
    id: "lens-polarized",
    name: "Polarized",
    priceUpcharge: 50,
    description:
      "Premium polarized lenses that eliminate reflections and enhance contrast.",
  },
];

export const products: SunglassesProduct[] = [
  {
    id: "prod-001",
    slug: "phantom",
    name: "PHANTOM",
    basePrice: 189,
    description:
      "Sharp angular frames forged for those who move in silence. The Phantom blends futuristic geometry with stealth-mode aesthetics — built to cut through the noise.",
    mainImage: "/images/phantom-main.png",
    lifestyleImage: "/images/phantom-lifestyle.png",
    galleryImages: [
      "/images/phantom-main.png",
      "/images/phantom-lifestyle.png",
    ],
    lensOptions: sharedLensOptions,
  },
  {
    id: "prod-002",
    slug: "venom",
    name: "VENOM",
    basePrice: 219,
    description:
      "Aggressive wraparound silhouette inspired by speed and venom. These frames hug the face like a second skin — designed for the relentless.",
    mainImage: "/images/venom-main.png",
    lifestyleImage: "/images/venom-lifestyle.png",
    galleryImages: ["/images/venom-main.png", "/images/venom-lifestyle.png"],
    lensOptions: sharedLensOptions,
  },
  {
    id: "prod-003",
    slug: "obsidian",
    name: "OBSIDIAN",
    basePrice: 249,
    description:
      "Bold, oversized, unapologetic. The Obsidian commands attention with its thick volcanic frame — a statement piece for those who refuse to blend in.",
    mainImage: "/images/obsidian-main.png",
    lifestyleImage: "/images/obsidian-lifestyle.png",
    galleryImages: [
      "/images/obsidian-main.png",
      "/images/obsidian-lifestyle.png",
    ],
    lensOptions: sharedLensOptions,
  },
  {
    id: "prod-004",
    slug: "spectre",
    name: "SPECTRE",
    basePrice: 279,
    description:
      "The Spectre is pure elegance distilled into metal. Ultra-thin aviator lines meet mirrored lenses — for the phantom who operates in plain sight.",
    mainImage: "/images/spectre-main.png",
    lifestyleImage: "/images/spectre-lifestyle.png",
    galleryImages: [
      "/images/spectre-main.png",
      "/images/spectre-lifestyle.png",
    ],
    lensOptions: sharedLensOptions,
  },
];
