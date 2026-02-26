import { Size } from "@prisma/client";

export type RawProduct = {
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

