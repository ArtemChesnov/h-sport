/**
 * Unit тесты для error-handler
 */

import { describe, it, expect } from "@jest/globals";
import { validateRequestSize } from "@/shared/lib/api/error-handler";
import { NextRequest } from "next/server";

// Создаём мок NextRequest
function createMockRequest(contentLength?: string): NextRequest {
  const headers = new Headers();
  if (contentLength) {
    headers.set("content-length", contentLength);
  }
  return new NextRequest("http://localhost:3000/test", { headers });
}

describe("Error Handler", () => {
  describe("validateRequestSize", () => {
    it("should return valid for request within limit", () => {
      const request = createMockRequest("1000");
      const result = validateRequestSize(request, 10 * 1024);
      expect(result.valid).toBe(true);
    });

    it("should return invalid for request exceeding limit", () => {
      const request = createMockRequest("2000000"); // ~2MB
      const result = validateRequestSize(request, 1024 * 1024); // 1MB limit
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.response).toBeDefined();
      }
    });

    it("should return valid when no content-length header", () => {
      const request = createMockRequest();
      const result = validateRequestSize(request, 1024);
      expect(result.valid).toBe(true);
    });

    it("should use default 1MB limit when not specified", () => {
      const request = createMockRequest("500000"); // 500KB
      const result = validateRequestSize(request);
      expect(result.valid).toBe(true);
    });

    it("should reject request larger than default limit", () => {
      const request = createMockRequest("2000000"); // 2MB
      const result = validateRequestSize(request);
      expect(result.valid).toBe(false);
    });

    it("should handle small limits correctly", () => {
      const request = createMockRequest("1000");
      // 500 bytes limit
      const result = validateRequestSize(request, 500);
      expect(result.valid).toBe(false);
    });

    it("should handle exact boundary correctly", () => {
      const request = createMockRequest("1024");
      // Exactly 1KB limit - should pass
      const result = validateRequestSize(request, 1024);
      expect(result.valid).toBe(true);
    });

    it("should handle one byte over limit", () => {
      const request = createMockRequest("1025");
      // 1KB limit - one byte over
      const result = validateRequestSize(request, 1024);
      expect(result.valid).toBe(false);
    });
  });
});
