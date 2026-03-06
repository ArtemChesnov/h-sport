/**
 * Rate Limiting (in-memory store).
 * Подходит для одного инстанса приложения.
 */

import { ONE_MINUTE_MS, RATE_LIMIT_CLEANUP_INTERVAL_MS } from "@/shared/constants";

// ===== ТИПЫ =====

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitStore {
  check(key: string, options: RateLimitOptions): RateLimitResult;
}

// ===== IN-MEMORY STORE =====

interface InMemoryRecord {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, InMemoryRecord>;
  __rateLimitCleanupRegistered?: boolean;
};

const inMemoryStore: Map<string, InMemoryRecord> =
  globalForRateLimit.__rateLimitStore || (globalForRateLimit.__rateLimitStore = new Map());

function cleanup(): void {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    if (record.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
}

if (typeof setInterval !== "undefined" && !globalForRateLimit.__rateLimitCleanupRegistered) {
  globalForRateLimit.__rateLimitCleanupRegistered = true;
  const cleanupInterval = setInterval(cleanup, RATE_LIMIT_CLEANUP_INTERVAL_MS);
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

class InMemoryRateLimitStore implements RateLimitStore {
  check(key: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const { maxRequests, windowMs } = options;

    const record = inMemoryStore.get(key);

    if (!record || record.resetAt < now) {
      inMemoryStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }
}

let currentStore: RateLimitStore = new InMemoryRateLimitStore();

export function setRateLimitStore(store: RateLimitStore): void {
  currentStore = store;
}

export function getRateLimitStore(): RateLimitStore {
  return currentStore;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60 * 1000 }
): RateLimitResult {
  return currentStore.check(key, options);
}

export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  return Promise.resolve(currentStore.check(key, options));
}

export function getRateLimitKey(request: Request, prefix?: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return prefix ? `${prefix}:${ip}` : ip;
}

export const RATE_LIMIT_CONFIGS = {
  auth: { maxRequests: 10, windowMs: ONE_MINUTE_MS },
  orders: { maxRequests: 50, windowMs: ONE_MINUTE_MS },
  upload: { maxRequests: 20, windowMs: ONE_MINUTE_MS },
  cart: { maxRequests: 60, windowMs: ONE_MINUTE_MS },
  webVitals: { maxRequests: 60, windowMs: ONE_MINUTE_MS },
  clientErrors: { maxRequests: 20, windowMs: ONE_MINUTE_MS },
  standard: { maxRequests: 100, windowMs: ONE_MINUTE_MS },
  catalog: { maxRequests: 100, windowMs: ONE_MINUTE_MS },
  product: { maxRequests: 120, windowMs: ONE_MINUTE_MS },
  heavy: { maxRequests: 20, windowMs: ONE_MINUTE_MS },
  admin: { maxRequests: 200, windowMs: ONE_MINUTE_MS },
  public: { maxRequests: 100, windowMs: ONE_MINUTE_MS },
  profile: { maxRequests: 30, windowMs: ONE_MINUTE_MS },
  payment: { maxRequests: 20, windowMs: ONE_MINUTE_MS },
  orderCancel: { maxRequests: 20, windowMs: ONE_MINUTE_MS },
  health: { maxRequests: 200, windowMs: ONE_MINUTE_MS },
} as const;
