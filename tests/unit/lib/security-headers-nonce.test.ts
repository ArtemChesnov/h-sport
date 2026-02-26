/**
 * Unit тесты для проверки nonce generation в security headers
 */

import { getContentSecurityPolicy, getRequestNonce } from "@/shared/lib/security/headers";
import { NextRequest } from "next/server";

describe("security headers nonce", () => {
  it("should generate nonce for production CSP", () => {
    const csp = getContentSecurityPolicy(true, "test-nonce-123");
    expect(csp).toContain("nonce-test-nonce-123");
    // Проверяем что script-src использует nonce вместо unsafe-inline
    // Примечание: style-src всё ещё содержит unsafe-inline для Tailwind CSS
    const scriptSrc = csp.split(";").find((d) => d.includes("script-src"));
    expect(scriptSrc).toContain("nonce-test-nonce-123");
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("should include strict-dynamic in production CSP for Next.js compatibility", () => {
    const csp = getContentSecurityPolicy(true, "test-nonce");
    const scriptSrc = csp.split(";").find((d) => d.includes("script-src"));
    // strict-dynamic позволяет скриптам с nonce загружать другие скрипты
    expect(scriptSrc).toContain("strict-dynamic");
  });

  it("should not include nonce in development CSP", () => {
    const csp = getContentSecurityPolicy(false);
    expect(csp).toContain("unsafe-inline");
    expect(csp).not.toContain("nonce-");
  });

  it("should generate valid nonce format", () => {
    const request = new NextRequest(new URL("http://localhost:3000"));
    const nonce = getRequestNonce(request);
    expect(nonce).toBeTruthy();
    expect(typeof nonce).toBe("string");
    expect(nonce.length).toBeGreaterThan(0);
  });
});
