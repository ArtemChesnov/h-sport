/**
 * Unit тесты для SKU генератора
 */

import {
  generateProductSku,
  generateSku,
  generateVariantSku,
} from "@/shared/lib/generators/sku-generator";
import { describe, expect, it } from "@jest/globals";

describe("SKU Generator", () => {
  describe("generateProductSku", () => {
    it("should generate product SKU with category", () => {
      const sku = generateProductSku(1, { categorySlug: "tops" });
      expect(sku).toBe("HS-TOP-0001");
    });

    it("should use fallback category when not provided", () => {
      const sku = generateProductSku(1, {});
      expect(sku).toBe("HS-GEN-0001");
    });

    it("should pad product ID with zeros", () => {
      expect(generateProductSku(1, { categorySlug: "tops" })).toBe("HS-TOP-0001");
      expect(generateProductSku(123, { categorySlug: "tops" })).toBe("HS-TOP-0123");
      expect(generateProductSku(1234, { categorySlug: "tops" })).toBe("HS-TOP-1234");
    });

    it("should normalize category slug", () => {
      expect(generateProductSku(1, { categorySlug: "top-sports" })).toBe("HS-TOP-0001");
      expect(generateProductSku(1, { categorySlug: "Топы" })).toBe("HS-GEN-0001"); // кириллица не поддерживается
    });
  });

  describe("generateVariantSku", () => {
    it("should generate variant SKU", () => {
      const baseSku = "HS-TOP-0001";
      const sku = generateVariantSku(baseSku, 0, { size: "M", color: "black" });
      // "black" -> первые 3 символа после нормализации = "BLA"
      expect(sku).toBe("HS-TOP-0001-M-BLA-01");
    });

    it("should pad variant index", () => {
      const baseSku = "HS-TOP-0001";
      expect(generateVariantSku(baseSku, 0, { size: "M", color: "black" })).toBe("HS-TOP-0001-M-BLA-01");
      expect(generateVariantSku(baseSku, 9, { size: "M", color: "black" })).toBe("HS-TOP-0001-M-BLA-10");
    });

    it("should use fallback for missing color", () => {
      const baseSku = "HS-TOP-0001";
      const sku = generateVariantSku(baseSku, 0, { size: "M" });
      expect(sku).toBe("HS-TOP-0001-M-CLR-01");
    });

    it("should use fallback for missing size", () => {
      const baseSku = "HS-TOP-0001";
      const sku = generateVariantSku(baseSku, 0, { color: "black" });
      expect(sku).toBe("HS-TOP-0001-NS-BLA-01");
    });

    it("should normalize color code", () => {
      const baseSku = "HS-TOP-0001";
      // "Black" -> "BLACK" -> первые 3 = "BLA"
      expect(generateVariantSku(baseSku, 0, { size: "M", color: "Black" })).toBe("HS-TOP-0001-M-BLA-01");
      // "dark-blue" -> "DARKBLUE" -> первые 3 = "DAR"
      expect(generateVariantSku(baseSku, 0, { size: "M", color: "dark-blue" })).toBe("HS-TOP-0001-M-DAR-01");
    });
  });

  describe("generateSku", () => {
    it("should generate complete SKU", () => {
      const sku = generateSku(1, 0, {
        categorySlug: "tops",
        size: "M",
        color: "black",
      });
      expect(sku).toBe("HS-TOP-0001-M-BLA-01");
    });

    it("should work without optional fields", () => {
      const sku = generateSku(1, 0, { categorySlug: "tops" });
      expect(sku).toBe("HS-TOP-0001-NS-CLR-01");
    });
  });
});
