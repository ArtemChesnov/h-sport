/**
 * Unit тесты для buildSearchString
 */

import { describe, it, expect } from "@jest/globals";
import { buildSearchString } from "@/shared/lib/search/build-search-string";

describe("buildSearchString", () => {
  it("should return empty string for default params", () => {
    expect(buildSearchString({})).toBe("");
    // CATALOG_DEFAULT_PER_PAGE = 24
    expect(buildSearchString({ page: 1, perPage: 24, sort: "new" })).toBe("");
  });

  it("should include page when > 1", () => {
    expect(buildSearchString({ page: 2 })).toBe("?page=2");
    expect(buildSearchString({ page: 10 })).toBe("?page=10");
  });

  it("should include perPage when not default", () => {
    expect(buildSearchString({ perPage: 10 })).toBe("?perPage=10");
    expect(buildSearchString({ perPage: 50 })).toBe("?perPage=50");
  });

  it("should include categorySlug", () => {
    expect(buildSearchString({ categorySlug: "tops" })).toBe("?categorySlug=tops");
  });

  it("should include sort when not 'new'", () => {
    expect(buildSearchString({ sort: "price_asc" })).toBe("?sort=price_asc");
    expect(buildSearchString({ sort: "price_desc" })).toBe("?sort=price_desc");
    expect(buildSearchString({ sort: "popular" })).toBe("?sort=popular");
  });

  it("should include search query", () => {
    // URLSearchParams автоматически кодирует кириллицу
    const result = buildSearchString({ q: "футболка" });
    expect(result).toContain("q=");
    expect(result).toContain("%D1%84"); // URL-encoded "ф"

    expect(buildSearchString({ q: "  trimmed  " })).toBe("?q=trimmed");
  });

  it("should combine multiple params", () => {
    const result = buildSearchString({
      page: 2,
      perPage: 10,
      categorySlug: "tops",
      sort: "price_asc",
      q: "футболка",
    });
    // URLSearchParams автоматически кодирует кириллицу
    expect(result).toContain("page=2");
    expect(result).toContain("perPage=10");
    expect(result).toContain("categorySlug=tops");
    expect(result).toContain("sort=price_asc");
    expect(result).toContain("q=");
    expect(result).toContain("%D1%84"); // URL-encoded "ф"
  });

  it("should ignore empty search query", () => {
    expect(buildSearchString({ q: "" })).toBe("");
    expect(buildSearchString({ q: "   " })).toBe("");
  });
});
