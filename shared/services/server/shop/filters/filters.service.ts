/**
 * Server service: catalog filters (colors, sizes, price range).
 */

import { prisma } from "@/prisma/prisma-client";
import type { Size } from "@prisma/client";

export interface CatalogFiltersDto {
  colors: string[];
  sizes: Size[];
  priceRange: { min: number; max: number };
}

const SIZE_ORDER: Size[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"];
const DEFAULT_PRICE_MAX = 120000;

/**
 * Returns aggregated catalog filters (colors, sizes, price range) for available product items.
 */
export async function getCatalogFilters(): Promise<CatalogFiltersDto> {
  const [priceAggregation, colorGroups, sizeGroups] = await Promise.all([
    prisma.productItem.aggregate({
      _min: { price: true },
      _max: { price: true },
      where: { isAvailable: true },
    }),
    prisma.productItem.groupBy({
      by: ["color"],
      where: { isAvailable: true },
    }),
    prisma.productItem.groupBy({
      by: ["size"],
      where: { isAvailable: true },
    }),
  ]);

  const colors = colorGroups
    .map((g) => g.color)
    .filter((c): c is string => Boolean(c && c.trim()))
    .sort();

  const sizes = sizeGroups
    .map((g) => g.size)
    .filter((s): s is Size => Boolean(s))
    .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

  const priceRange = {
    min: priceAggregation._min?.price ?? 0,
    max: priceAggregation._max?.price ?? DEFAULT_PRICE_MAX,
  };

  return { colors, sizes, priceRange };
}
