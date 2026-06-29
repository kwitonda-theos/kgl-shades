import { SunglassesProduct } from "./product";

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  products: SunglassesProduct[];
  createdAt: string;
}
