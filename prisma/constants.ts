import { Size } from "@prisma/client";
import { RawProduct } from "./types";

import clientProductsJson from "./data/raw_products_from_client.json";

type ClientVariation = {
  color: string;
  sizes: string[];
  priceRub: number;
  composition: string | null;
  isAvailable: boolean;
};

type ClientProduct = {
  name: string;
  categorySlug: string;
  description?: string;
  variations: ClientVariation[];
};

function normalizeComposition(c: string | null): string {
  if (!c || !c.trim()) return "";
  let s = c.replace(/polyamed/gi, "polyamide").replace(/\b91nylon\b/gi, "91% nylon");
  s = s
    .replace(/\bnylon\b/gi, "нейлон")
    .replace(/\belastane\b/gi, "эластан")
    .replace(/\bpolyester\b/gi, "полиэстер")
    .replace(/\bpolyamide\b/gi, "полиамид")
    .replace(/\blycra\b/gi, "лайкра")
    .replace(/\bspandex\b/gi, "спандекс")
    .replace(/\bcotton\b/gi, "хлопок");
  return s.trim();
}

function mapSizes(sizes: string[]): Size[] {
  if (!sizes || sizes.length === 0) return [Size.ONE_SIZE];
  const out: Size[] = [];
  for (const s of sizes) {
    const u = s.toUpperCase();
    const size = (Size as Record<string, Size>)[u];
    if (size) out.push(size);
    else out.push(Size.ONE_SIZE);
  }
  return out;
}

const clientProducts = clientProductsJson as ClientProduct[];

export const RAW_PRODUCTS: RawProduct[] = clientProducts.map((p) => ({
  name: p.name,
  categorySlug: p.categorySlug,
  description: p.description ?? undefined,
  variations: p.variations.map((v) => ({
    color: v.color.trim(),
    sizes: mapSizes(v.sizes),
    priceRub: v.priceRub,
    composition: normalizeComposition(v.composition),
    isAvailable: v.isAvailable,
  })),
}));
