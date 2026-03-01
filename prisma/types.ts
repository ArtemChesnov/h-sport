import { Size } from "@prisma/client";

export type RawProduct = {
  id?: number; // id из products_with_id.json — подставляется в Product.id при сидинге
  name: string;
  categorySlug: string;
  description?: string;
  variations: RawProductVariation[];
};

export type RawProductVariation = {
  color: string;
  sizes: Size[];
  priceRub: number;
  composition: string;
  isAvailable: boolean;
};
