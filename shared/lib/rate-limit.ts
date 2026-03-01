/**
 * Rate Limiting с поддержкой Redis
 *
 * По умолчанию использует in-memory store.
 * При наличии REDIS_URL автоматически использует Redis store.
 *
 * Для использования Redis установите:
 * npm install redis
 *
 * И добавьте переменную окружения:
 * REDIS_URL=redis://...
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

/**
 * Интерфейс для store (можно реализовать для Redis)
 */
export interface RateLimitStore {
  check(key: string, options: RateLimitOptions): Promise<RateLimitResult> | RateLimitResult;
}

// ===== IN-MEMORY STORE (default) =====

interface InMemoryRecord {
  count: number;
  resetAt: number;
}

// Используем globalThis для защиты от HMR дублирования
const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, InMemoryRecord>;
  __rateLimitCleanupRegistered?: boolean;
};

// Глобальный store (защищён от HMR)
const inMemoryStore: Map<string, InMemoryRecord> =
  globalForRateLimit.__rateLimitStore || (globalForRateLimit.__rateLimitStore = new Map());

/**
 * Очистка устаревших записей
 */
function cleanup(): void {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    if (record.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
}

// Периодическая очистка устаревших записей (защита от HMR дублирования)
// Используем .unref() чтобы интервал не блокировал завершение процесса
if (typeof setInterval !== "undefined" && !globalForRateLimit.__rateLimitCleanupRegistered) {
  globalForRateLimit.__rateLimitCleanupRegistered = true;
  const cleanupInterval = setInterval(cleanup, RATE_LIMIT_CLEANUP_INTERVAL_MS);
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

/**
 * In-memory rate limit store
 */
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

// ===== REDIS STORE (для production) =====

/**
 * Создаёт Redis-based rate limit store
 *
 * @example
 * import { Redis } from "@upstash/redis";
 *
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL!,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 * });
 *
 * const store = createRedisRateLimitStore(redis);
 * setRateLimitStore(store);
 */
export function createRedisRateLimitStore(redis: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<unknown>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<unknown>;
  ttl: (key: string) => Promise<number>;
}): RateLimitStore {
  const PREFIX = "rate-limit:";

  return {
    async check(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
      const { maxRequests, windowMs } = options;
      const windowSeconds = Math.ceil(windowMs / 1000);
      const redisKey = PREFIX + key;

      // Инкрементируем счётчик
      const count = await redis.incr(redisKey);

      // Если это первый запрос, устанавливаем TTL
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      // Получаем оставшееся время
      const ttl = await redis.ttl(redisKey);
      const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);

      if (count > maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      return {
        allowed: true,
        remaining: maxRequests - count,
        resetAt,
      };
    },
  };
}

// ===== SINGLETON & API =====

/**
 * Гибридный store, который автоматически выбирает Redis (если доступен) или in-memory
 */
class HybridRateLimitStore implements RateLimitStore {
  private redisStore: RateLimitStore | null = null;
  private inMemoryStore: RateLimitStore = new InMemoryRateLimitStore();
  private initAttempted = false;

  private async ensureInitialized(): Promise<RateLimitStore> {
    // Если уже инициализирован, возвращаем текущий store
    if (this.redisStore) {
      return this.redisStore;
    }

    // Если уже пробовали инициализировать, используем in-memory
    if (this.initAttempted) {
      return this.inMemoryStore;
    }

    this.initAttempted = true;

    // При наличии REDIS_URL пытаемся использовать Redis
    const { env } = await import("@/shared/lib/config/env");
    if (env.REDIS_URL) {
      try {
        const { getRedisClient } = await import("./redis");
        const redisClient = await getRedisClient();

        if (redisClient) {
          // Создаём Redis store через существующую функцию
          this.redisStore = createRedisRateLimitStore({
            get: redisClient.get.bind(redisClient),
            set: async (key: string, value: string, options?: { ex?: number }) => {
              return await redisClient.set(key, value, { EX: options?.ex, ex: options?.ex });
            },
            incr: redisClient.incr.bind(redisClient),
            expire: redisClient.expire.bind(redisClient),
            ttl: redisClient.ttl.bind(redisClient),
          });
          return this.redisStore;
        }
      } catch {
        // При ошибке используем in-memory fallback
        // Логирование уже сделано в getRedisClient
      }
    }

    // Используем in-memory store как fallback
    return this.inMemoryStore;
  }

  check(key: string, options: RateLimitOptions): RateLimitResult | Promise<RateLimitResult> {
    // Для синхронного вызова (backwards compatibility) используем in-memory
    // Асинхронные вызовы будут через ensureInitialized
    return this.inMemoryStore.check(key, options);
  }

  async checkAsync(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const store = await this.ensureInitialized();
    const result = store.check(key, options);
    return result instanceof Promise ? result : Promise.resolve(result);
  }
}

/**
 * Текущий store
 * Автоматически выбирает Redis в production, иначе in-memory
 */
const hybridStore = new HybridRateLimitStore();

/**
 * Текущий store (для backwards compatibility с существующим кодом)
 * В production с Redis будет использоваться Redis store через checkRateLimitAsync
 * В остальных случаях - in-memory store
 */
let currentStore: RateLimitStore = new InMemoryRateLimitStore();

/**
 * Устанавливает store для rate limiting
 * Вызвать в app/providers.tsx или middleware для переключения на Redis
 * @internal Используется при инициализации Redis, не для публичного API
 */
export function setRateLimitStore(store: RateLimitStore): void {
  currentStore = store;
}

/**
 * Получает текущий store
 * @internal Для тестов и отладки, не для публичного API
 */
export function getRateLimitStore(): RateLimitStore {
  return currentStore;
}

/**
 * Проверяет rate limit для ключа
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60 * 1000 }
): RateLimitResult {
  const result = currentStore.check(key, options);

  // Если store возвращает Promise (Redis), превращаем в sync
  // Для backwards compatibility, так как текущий код синхронный
  if (result instanceof Promise) {
    // Для асинхронного store используйте checkRateLimitAsync
    throw new Error("Use checkRateLimitAsync for async store (Redis)");
  }

  return result;
}

/**
 * Проверяет rate limit асинхронно (для Redis)
 * В production с Redis автоматически использует Redis store
 * В остальных случаях использует in-memory store
 */
export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  // Используем гибридный store, который автоматически выбирает Redis в production
  return await hybridStore.checkAsync(key, options);
}

/**
 * Генерирует ключ для rate limiting на основе IP
 */
export function getRateLimitKey(request: Request, prefix?: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return prefix ? `${prefix}:${ip}` : ip;
}

/**
 * Единый источник конфигов rate limit для всех endpoints.
 * Используется в shared/lib/api/rate-limit-middleware (applyRateLimit).
 */
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

/**
 * Инициализирует Redis rate limiting
 *
 * Для использования:
 * 1. Установить пакет: npm install @upstash/redis
 * 2. Вызвать эту функцию с экземпляром Redis
 *
 * @example
 * import { Redis } from "@upstash/redis";
 * import { initRedisRateLimiting } from "@/shared/lib/rate-limit";
 *
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL!,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 * });
 * initRedisRateLimiting(redis);
 */
export function initRedisRateLimiting(redis: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { ex?: number }) => Promise<unknown>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<unknown>;
  ttl: (key: string) => Promise<number>;
}): void {
  const store = createRedisRateLimitStore(redis);
  setRateLimitStore(store);
}
