import { Size } from "@prisma/client";
import { RawProduct } from "./types";

import productsJson from "./data/products_with_id.json";

type JsonVariant = {
  color: string;
  sizes: string[];
  isAvailable?: boolean;
};

type JsonProduct = {
  id?: number;
  name: string;
  price: number;
  composition: string | null;
  description?: string | null;
  isAvailable?: boolean;
  variants: JsonVariant[];
};

/** Маппинг названия товара на slug категории (из seed.ts) */
const NAME_TO_CATEGORY: Record<string, string> = {
  Топ: "tops",
  "Топ на молнии": "tops",
  Леггинсы: "leggings",
  Платье: "dresses-jumpsuits",
  Комбинезон: "dresses-jumpsuits",
  Боди: "bodysuits",
  "Юбка-шорты": "skirts",
  Юбка: "skirts",
  Майка: "tanks-tees",
  Футболка: "tanks-tees",
  Лонгслив: "longsleeves",
  "Брюки спортивные": "pants",
  Велосипедки: "shorts-bikers",
  Шорты: "shorts",
  Ветровка: "outerwear",
  Куртка: "outerwear",
  "Куртка мех": "outerwear",
  Жилет: "outerwear",
  "Кофта на молнии": "outerwear",
  "Кофта на молнии флис": "outerwear",
  Сумка: "accessories",
};

function getCategorySlug(name: string): string {
  return NAME_TO_CATEGORY[name] ?? "tops";
}

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
  const seen = new Set<Size>();
  for (const s of sizes) {
    const u = s.toLowerCase().trim();
    if (u === "one" || u === "size") {
      if (!seen.has(Size.ONE_SIZE)) {
        out.push(Size.ONE_SIZE);
        seen.add(Size.ONE_SIZE);
      }
      continue;
    }
    const sizeKey = u.toUpperCase();
    const size = (Size as Record<string, Size>)[sizeKey];
    if (size && !seen.has(size)) {
      out.push(size);
      seen.add(size);
    } else if (!seen.has(Size.ONE_SIZE)) {
      out.push(Size.ONE_SIZE);
      seen.add(Size.ONE_SIZE);
    }
  }
  return out.length ? out : [Size.ONE_SIZE];
}

const products = productsJson as JsonProduct[];

export const RAW_PRODUCTS: RawProduct[] = products.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description ?? undefined,
  categorySlug: getCategorySlug(p.name),
  variations: p.variants.map((v) => ({
    color: v.color.trim(),
    sizes: mapSizes(v.sizes),
    priceRub: p.price,
    composition: normalizeComposition(p.composition),
    isAvailable: v.isAvailable ?? p.isAvailable ?? true,
  })),
}));
