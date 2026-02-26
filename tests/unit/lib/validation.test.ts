/**
 * Базовые unit тесты для валидации
 */

import { describe, it, expect } from "@jest/globals";
import { isValidEmail, validateSearchQuery } from "@/shared/lib/validation";

describe("Validation", () => {
  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("validateSearchQuery", () => {
    it("should return trimmed query", () => {
      expect(validateSearchQuery("  test  ")).toBe("test");
    });

    it("should return null for empty query", () => {
      expect(validateSearchQuery("")).toBeNull();
      expect(validateSearchQuery("   ")).toBeNull();
      expect(validateSearchQuery(null)).toBeNull();
      expect(validateSearchQuery(undefined)).toBeNull();
    });

    it("should truncate long query", () => {
      const longQuery = "a".repeat(300);
      const result = validateSearchQuery(longQuery, 200);
      expect(result?.length).toBeLessThanOrEqual(200);
    });
  });
});
