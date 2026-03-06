/**
 * Тесты для buildCatalogCacheKey: канонизация, лимиты, hash при длинном ключе.
 */

import { describe, it, expect } from "@jest/globals";
import {
  buildCatalogCacheKey,
  MAX_CATALOG_CACHE_KEY_LENGTH,
  MAX_SEARCH_LENGTH_FOR_CACHE,
} from "@/shared/lib/products";
import type { ParsedProductsQuery } from "@/shared/lib/products";

describe("buildCatalogCacheKey", () => {
  it("should produce stable key for same query", () => {
    const query: ParsedProductsQuery = {
      page: 1,
      perPage: 24,
      sort: "new",
      categorySlug: ["tops", "leggings"],
      color: ["black", "red"],
      size: ["S", "M"],
      priceFrom: 1000,
      priceTo: 5000,
      q: "футболка",
    };
    const key1 = buildCatalogCacheKey(query);
    const key2 = buildCatalogCacheKey({ ...query, categorySlug: ["leggings", "tops"] });
    expect(key1).toBe(key2);
    expect(key1).toMatch(/^catalog:v1\|/);
    expect(key1).toContain("products");
    expect(key1).toContain("page:1");
    expect(key1).toContain("perPage:24");
    expect(key1).toContain("cat:leggings,tops");
    expect(key1).toContain("color:black,red");
  });

  it("should truncate long search string", () => {
    const longQ = "a".repeat(MAX_SEARCH_LENGTH_FOR_CACHE + 100);
    const key = buildCatalogCacheKey({
      page: 1,
      perPage: 24,
      sort: "new",
      q: longQ,
    });
    expect(key).toMatch(/^catalog:v1\|/);
    expect(key.length).toBeLessThanOrEqual(MAX_CATALOG_CACHE_KEY_LENGTH + 80);
  });

  it("should use hash format when key exceeds max length (stable: same input → same output)", () => {
    const manyCats = Array.from({ length: 50 }, (_, i) => `category-${i}`);
    const query = { page: 1, perPage: 24, sort: "new" as const, categorySlug: manyCats };
    const key1 = buildCatalogCacheKey(query);
    const key2 = buildCatalogCacheKey(query);
    expect(key1).toBe(key2);
    expect(key1.startsWith("catalog:v1|products:h:")).toBe(true);
    expect(key1.length).toBeLessThan(80);
  });
});
