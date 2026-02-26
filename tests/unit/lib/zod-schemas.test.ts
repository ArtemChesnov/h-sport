/**
 * Unit тесты для Zod схем
 */

import {
  emailSchema,
  idSchema,
  paginationSchema,
  passwordSchema,
  searchQuerySchema,
  slugSchema,
} from "@/shared/lib/validation/zod-schemas";
import { describe, expect, it } from "@jest/globals";

describe("Zod Schemas", () => {
  describe("emailSchema", () => {
    it("should validate correct emails", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@domain.co.uk").success).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(emailSchema.safeParse("invalid").success).toBe(false);
      expect(emailSchema.safeParse("invalid@").success).toBe(false);
      expect(emailSchema.safeParse("@domain.com").success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("should validate correct passwords", () => {
      expect(passwordSchema.safeParse("Password123").success).toBe(true);
      expect(passwordSchema.safeParse("MyP@ssw0rd").success).toBe(true);
    });

    it("should reject short passwords", () => {
      const result = passwordSchema.safeParse("Pass1");
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstError = result.error.issues[0];
        expect(firstError?.message).toContain("минимум 8");
      }
    });

    it("should reject passwords without letters", () => {
      const result = passwordSchema.safeParse("12345678");
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstError = result.error.issues[0];
        expect(firstError?.message).toContain("буквы");
      }
    });

    it("should reject passwords without numbers", () => {
      const result = passwordSchema.safeParse("Password");
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstError = result.error.issues[0];
        expect(firstError?.message).toContain("цифры");
      }
    });
  });

  describe("searchQuerySchema", () => {
    it("should trim and transform search query", () => {
      const result = searchQuerySchema.safeParse("  test  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test");
      }
    });

    it("should return undefined for empty strings", () => {
      const result = searchQuerySchema.safeParse("");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it("should validate max length", () => {
      const longQuery = "a".repeat(300);
      const result = searchQuerySchema.safeParse(longQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("paginationSchema", () => {
    it("should parse valid pagination", () => {
      const result = paginationSchema.safeParse({ page: 1, perPage: 20 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.perPage).toBe(20);
      }
    });

    it("should use defaults", () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.perPage).toBe(20);
      }
    });

    it("should coerce string numbers", () => {
      const result = paginationSchema.safeParse({ page: "2", perPage: "10" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.perPage).toBe(10);
      }
    });

    it("should validate max perPage", () => {
      const result = paginationSchema.safeParse({ perPage: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("idSchema", () => {
    it("should validate positive integers", () => {
      expect(idSchema.safeParse(1).success).toBe(true);
      expect(idSchema.safeParse(123).success).toBe(true);
    });

    it("should coerce string numbers", () => {
      const result = idSchema.safeParse("123");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(123);
      }
    });

    it("should reject negative numbers", () => {
      expect(idSchema.safeParse(-1).success).toBe(false);
    });

    it("should reject zero", () => {
      expect(idSchema.safeParse(0).success).toBe(false);
    });
  });

  describe("slugSchema", () => {
    it("should validate correct slugs", () => {
      expect(slugSchema.safeParse("hello-world").success).toBe(true);
      expect(slugSchema.safeParse("product123").success).toBe(true);
      expect(slugSchema.safeParse("test-slug-123").success).toBe(true);
    });

    it("should reject uppercase letters", () => {
      expect(slugSchema.safeParse("Hello-World").success).toBe(false);
    });

    it("should reject special characters", () => {
      expect(slugSchema.safeParse("hello_world").success).toBe(false);
      expect(slugSchema.safeParse("hello world").success).toBe(false);
      expect(slugSchema.safeParse("hello@world").success).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(slugSchema.safeParse("").success).toBe(false);
    });
  });
});
