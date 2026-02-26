/**
 * Unit тесты для парсеров admin/products
 */

import { parseAvailability, parseSort } from "@/shared/lib/products/admin/parsers";

describe("admin products parsers", () => {
  describe("parseSort", () => {
    it("should parse valid sort values", () => {
      expect(parseSort("new")).toBe("new");
      expect(parseSort("price_asc")).toBe("price_asc");
      expect(parseSort("price_desc")).toBe("price_desc");
      expect(parseSort("popular")).toBe("popular");
    });

    it("should return default 'new' for invalid values", () => {
      expect(parseSort("invalid")).toBe("new");
      expect(parseSort(null)).toBe("new");
      expect(parseSort("")).toBe("new");
    });
  });

  describe("parseAvailability", () => {
    it("should parse valid availability values", () => {
      expect(parseAvailability("available")).toBe("available");
      expect(parseAvailability("unavailable")).toBe("unavailable");
    });

    it("should return undefined for invalid values", () => {
      expect(parseAvailability("invalid")).toBeUndefined();
      expect(parseAvailability(null)).toBeUndefined();
      expect(parseAvailability("")).toBeUndefined();
    });
  });
});
