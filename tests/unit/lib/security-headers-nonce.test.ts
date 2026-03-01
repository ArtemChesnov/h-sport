/**
 * Unit тесты для CSP в security headers
 */

import { getContentSecurityPolicy } from "@/shared/lib/security/headers";

describe("security headers CSP", () => {
  it("should use unsafe-inline in production CSP for Next.js compatibility", () => {
    const csp = getContentSecurityPolicy(true);
    const scriptSrc = csp.split(";").find((d) => d.includes("script-src"));
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("strict-dynamic");
    expect(scriptSrc).not.toContain("nonce-");
  });

  it("should include frame-ancestors none in production", () => {
    const csp = getContentSecurityPolicy(true);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("should use unsafe-eval in development CSP", () => {
    const csp = getContentSecurityPolicy(false);
    expect(csp).toContain("unsafe-eval");
    expect(csp).toContain("unsafe-inline");
  });

  it("should allow ws/wss in development for hot reload", () => {
    const csp = getContentSecurityPolicy(false);
    expect(csp).toContain("ws:");
    expect(csp).toContain("wss:");
  });
});
