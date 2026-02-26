/**
 * Unit тесты для rate-limit
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { checkRateLimit, getRateLimitKey, RATE_LIMIT_CONFIGS } from "@/shared/lib/rate-limit";

describe("RateLimit", () => {
  beforeEach(() => {
    // Используем уникальные ключи для каждого теста, чтобы избежать конфликтов
  });

  describe("checkRateLimit", () => {
    it("should allow first request", () => {
      const result = checkRateLimit("test-key-1", { maxRequests: 5, windowMs: 1000 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track multiple requests", () => {
      const key = "test-key-2";
      const options = { maxRequests: 3, windowMs: 1000 };

      const result1 = checkRateLimit(key, options);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(key, options);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit(key, options);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it("should block after max requests", () => {
      const key = "test-key-3";
      const options = { maxRequests: 2, windowMs: 1000 };

      checkRateLimit(key, options);
      checkRateLimit(key, options);
      const result = checkRateLimit(key, options);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after window expires", (done) => {
      const key = "test-key-4";
      const options = { maxRequests: 2, windowMs: 100 };

      checkRateLimit(key, options);
      checkRateLimit(key, options);

      setTimeout(() => {
        const result = checkRateLimit(key, options);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(1);
        done();
      }, 150);
    });

    it("should use default options", () => {
      const result = checkRateLimit("default-key-5");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99); // default maxRequests is 100
    });
  });

  describe("getRateLimitKey", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("http://example.com", {
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      const key = getRateLimitKey(request);
      expect(key).toBe("192.168.1.1");
    });

    it("should use first IP from comma-separated list", () => {
      const request = new Request("http://example.com", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      });
      const key = getRateLimitKey(request);
      expect(key).toBe("192.168.1.1");
    });

    it("should use 'unknown' when no header", () => {
      const request = new Request("http://example.com");
      const key = getRateLimitKey(request);
      expect(key).toBe("unknown");
    });

    it("should include prefix when provided", () => {
      const request = new Request("http://example.com", {
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      const key = getRateLimitKey(request, "orders");
      expect(key).toBe("orders:192.168.1.1");
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("should have auth config with 10 requests per minute", () => {
      expect(RATE_LIMIT_CONFIGS.auth).toEqual({
        maxRequests: 10,
        windowMs: 60 * 1000,
      });
    });

    it("should have orders config with 50 requests per minute", () => {
      expect(RATE_LIMIT_CONFIGS.orders).toEqual({
        maxRequests: 50,
        windowMs: 60 * 1000,
      });
    });

    it("should have upload config with 20 requests per minute", () => {
      expect(RATE_LIMIT_CONFIGS.upload).toEqual({
        maxRequests: 20,
        windowMs: 60 * 1000,
      });
    });

    it("should have cart config with 60 requests per minute", () => {
      expect(RATE_LIMIT_CONFIGS.cart).toEqual({
        maxRequests: 60,
        windowMs: 60 * 1000,
      });
    });

    it("should have standard config with 100 requests per minute", () => {
      expect(RATE_LIMIT_CONFIGS.standard).toEqual({
        maxRequests: 100,
        windowMs: 60 * 1000,
      });
    });
  });
});
