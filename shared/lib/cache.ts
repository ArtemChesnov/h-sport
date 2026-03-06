/**
 * In-memory кэш с TTL и LRU-очисткой.
 * Подходит для одного инстанса приложения.
 *
 * - Single-flight (getOrSetAsync): защита от cache stampede; loader с таймаутом (CACHE_LOADER_TIMEOUT_MS).
 * - Метрики: hits, misses, evictions, approxBytes.
 * - Инвалидация по префиксу (delByPrefix) и хелперы для product/catalog/categories.
 * - CACHE_DEBUG=true: периодический вывод статистики (guard от повторной регистрации при hot reload).
 */

import { CACHE_CLEANUP_INTERVAL_MS } from "@/shared/constants";

const DEFAULT_LOADER_TIMEOUT_MS = 15000;
const CACHE_LOADER_TIMEOUT_MS =
  typeof process !== "undefined" && process.env.CACHE_LOADER_TIMEOUT_MS
    ? Math.max(
        1000,
        Math.min(
          60000,
          parseInt(process.env.CACHE_LOADER_TIMEOUT_MS, 10) || DEFAULT_LOADER_TIMEOUT_MS
        )
      )
    : DEFAULT_LOADER_TIMEOUT_MS;

/** Таймаут для loader: Promise.race; только результат race кэшируется; поздно завершившийся loader не пишет в кэш. */
function withLoaderTimeout<T>(loader: () => Promise<T>, timeoutMs: number): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      metrics.loaderTimeouts += 1;
      reject(new Error(`CACHE_LOADER_TIMEOUT: ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([loader(), timeoutPromise]).finally(() => {
    if (timerId !== undefined) clearTimeout(timerId);
  });
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

const globalForCache = globalThis as typeof globalThis & {
  __cacheStore?: Map<string, CacheEntry<unknown>>;
  __cacheCleanupRegistered?: boolean;
  __cacheDebugRegistered?: boolean;
  __cacheMetrics?: {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
    loaderTimeouts: number;
  };
  __cacheInFlight?: Map<string, Promise<unknown>>;
};

const cache: Map<string, CacheEntry<unknown>> = globalForCache.__cacheStore ||
(globalForCache.__cacheStore = new Map());

const metrics =
  globalForCache.__cacheMetrics ||
  (globalForCache.__cacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    loaderTimeouts: 0,
  });

const inFlight = globalForCache.__cacheInFlight || (globalForCache.__cacheInFlight = new Map());

const MAX_CACHE_SIZE = 10000;
const CLEANUP_INTERVAL_MS = CACHE_CLEANUP_INTERVAL_MS;
const ACCESS_COUNT_THRESHOLD = 5;
const CACHE_DEBUG_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const APPROX_BYTES_PER_ENTRY = 2048;

/** Локально уникальный маркер «закэшированный null» (Symbol без .for — не разделяется с другим кодом; approxBytes по количеству записей). */
const NULL_SENTINEL = Symbol("cache.null");

/** Версия ключей (при смене схемы — инвалидировать старый кэш). */
export const CACHE_VERSION = "v1";

function cleanup() {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  const activeEntries: Array<{ key: string; lastAccessed: number }> = [];

  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      entriesToDelete.push(key);
    } else {
      activeEntries.push({ key, lastAccessed: entry.lastAccessed });
    }
  }

  for (const key of entriesToDelete) {
    cache.delete(key);
    metrics.evictions += 1;
  }

  if (cache.size > MAX_CACHE_SIZE) {
    activeEntries.sort((a, b) => {
      const entryA = cache.get(a.key) as CacheEntry<unknown>;
      const entryB = cache.get(b.key) as CacheEntry<unknown>;
      if (
        entryA.accessCount < ACCESS_COUNT_THRESHOLD &&
        entryB.accessCount >= ACCESS_COUNT_THRESHOLD
      ) {
        return -1;
      }
      if (
        entryA.accessCount >= ACCESS_COUNT_THRESHOLD &&
        entryB.accessCount < ACCESS_COUNT_THRESHOLD
      ) {
        return 1;
      }
      return a.lastAccessed - b.lastAccessed;
    });

    const toRemove = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove && i < activeEntries.length; i++) {
      cache.delete(activeEntries[i].key);
      metrics.evictions += 1;
    }
  }
}

if (typeof setInterval !== "undefined" && !globalForCache.__cacheCleanupRegistered) {
  globalForCache.__cacheCleanupRegistered = true;
  const cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MS);
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }

  if (
    typeof process !== "undefined" &&
    process.env.CACHE_DEBUG === "true" &&
    !globalForCache.__cacheDebugRegistered
  ) {
    globalForCache.__cacheDebugRegistered = true;
    const debugInterval = setInterval(() => {
      const s = getCacheStats();
      const hitRate =
        s.hits + s.misses > 0 ? ((s.hits / (s.hits + s.misses)) * 100).toFixed(1) : "0";
      const timeoutRate =
        s.loaderTimeoutRate != null ? (s.loaderTimeoutRate * 100).toFixed(1) + "%" : "n/a";
      console.log(
        `[cache] entries=${s.entries} inFlight=${s.inFlightCount} hits=${s.hits} misses=${s.misses} sets=${s.sets} evictions=${s.evictions} loaderTimeouts=${s.loaderTimeouts} loaderTimeoutRate=${timeoutRate} hitRate=${hitRate}% approxBytes=${s.approxBytes ?? "n/a"}`
      );
    }, CACHE_DEBUG_INTERVAL_MS);
    if (typeof (debugInterval as NodeJS.Timeout).unref === "function") {
      (debugInterval as NodeJS.Timeout).unref();
    }
  }
}

export function get<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T | typeof NULL_SENTINEL> | undefined;
  if (!entry) {
    metrics.misses += 1;
    return null;
  }

  const now = Date.now();
  if (entry.expiresAt < now) {
    cache.delete(key);
    metrics.evictions += 1;
    metrics.misses += 1;
    return null;
  }

  metrics.hits += 1;
  entry.accessCount += 1;
  entry.lastAccessed = now;

  if (entry.value === NULL_SENTINEL) return null as T;
  return entry.value as T;
}

export async function getAsync<T>(key: string): Promise<T | null> {
  return Promise.resolve(get<T>(key));
}

export type GetOrSetResult<T> = { value: T; fromCache: boolean };

export type GetOrSetOptions = {
  /** Кэшировать null/undefined на короткий TTL (защита от повторных тяжёлых запросов «не найден»). */
  cacheNull?: boolean;
  /** TTL для null/undefined в мс (по умолчанию 60с). */
  nullTtlMs?: number;
};

/**
 * Получить значение из кэша или вычислить через loader (single-flight: при промахе
 * только один вызов loader с таймаутом, остальные ждут тот же Promise).
 * Ошибки и таймаут loader не кэшируются; inFlight всегда очищается в finally.
 * Loader должен быть идемпотентным: при таймауте позднее завершившийся loader всё равно выполнит побочные эффекты (результат в кэш не попадёт).
 */
export async function getOrSetAsync<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number,
  options?: GetOrSetOptions
): Promise<GetOrSetResult<T>> {
  const now = Date.now();
  const entry = cache.get(key) as CacheEntry<T | typeof NULL_SENTINEL> | undefined;
  if (entry && entry.expiresAt >= now) {
    metrics.hits += 1;
    entry.accessCount += 1;
    entry.lastAccessed = now;
    const value = entry.value === NULL_SENTINEL ? (null as T) : (entry.value as T);
    return { value, fromCache: true };
  }
  if (entry && entry.expiresAt < now) {
    cache.delete(key);
    metrics.evictions += 1;
  }
  metrics.misses += 1;

  const existing = inFlight.get(key) as Promise<GetOrSetResult<T>> | undefined;
  if (existing) return existing;

  const promise = (async (): Promise<GetOrSetResult<T>> => {
    try {
      const value = await withLoaderTimeout(loader, CACHE_LOADER_TIMEOUT_MS);
      const isNullish = value === null || value === undefined;
      if (isNullish && options?.cacheNull) {
        const nullTtl = options.nullTtlMs ?? 60000;
        set(key, NULL_SENTINEL as unknown as T, nullTtl);
      } else if (!isNullish) {
        set(key, value, ttlMs);
      }
      return { value, fromCache: false };
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise as Promise<unknown>);
  return promise;
}

export function set<T>(key: string, value: T, ttlMs: number): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanup();
  }

  metrics.sets += 1;
  const now = Date.now();
  cache.set(key, {
    value,
    expiresAt: now + ttlMs,
    accessCount: 0,
    lastAccessed: now,
  });
}

export function getCacheStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  entries: number;
  inFlightCount: number;
  loaderTimeouts: number;
  /** Доля промахов, закончившихся таймаутом loader'а (удобно для диагностики). */
  loaderTimeoutRate?: number;
  approxBytes?: number;
} {
  const total = metrics.hits + metrics.misses;
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    hitRate: total > 0 ? metrics.hits / total : undefined,
    hits: metrics.hits,
    misses: metrics.misses,
    sets: metrics.sets,
    evictions: metrics.evictions,
    entries: cache.size,
    inFlightCount: inFlight.size,
    loaderTimeouts: metrics.loaderTimeouts,
    loaderTimeoutRate: metrics.misses > 0 ? metrics.loaderTimeouts / metrics.misses : undefined,
    approxBytes: cache.size * APPROX_BYTES_PER_ENTRY,
  };
}

export function del(key: string): void {
  cache.delete(key);
}

export async function delAsync(key: string): Promise<void> {
  cache.delete(key);
}

/** Удалить все ключи с заданным префиксом (для инвалидации каталога и т.п.). */
export function delByPrefix(prefix: string): number {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      count += 1;
    }
  }
  return count;
}

export function clear(): void {
  cache.clear();
}

// ─── Версионированные ключи и инвалидация ────────────────────────────────────────────────

const CATALOG_KEY_PREFIX = `catalog:${CACHE_VERSION}`;
const PRODUCT_KEY_PREFIX = `product:${CACHE_VERSION}:`;
const CATEGORIES_KEY = `categories:${CACHE_VERSION}_list`;
const NEW_POPULAR_PREFIX = `new-products:${CACHE_VERSION}:`;
const POPULAR_PREFIX = `popular:${CACHE_VERSION}:`;
const BESTSELLERS_PREFIX = `bestsellers:${CACHE_VERSION}:`;

/** Ключ кэша детали товара (для GET и инвалидации). */
export function getProductCacheKey(slug: string): string {
  return `${PRODUCT_KEY_PREFIX}${slug}`;
}

/** Ключ кэша списка категорий. */
export function getCategoriesCacheKey(): string {
  return CATEGORIES_KEY;
}

/** Ключ кэша блока новинок. */
export function getNewProductsCacheKey(limit: number): string {
  return `${NEW_POPULAR_PREFIX}${limit}`;
}

/** Ключ кэша блока популярных. */
export function getPopularCacheKey(limit: number): string {
  return `${POPULAR_PREFIX}${limit}`;
}

/** Ключ кэша блока бестселлеров. */
export function getBestsellersCacheKey(limit: number): string {
  return `${BESTSELLERS_PREFIX}${limit}`;
}

/** Инвалидировать кэш одного товара по slug. */
export function invalidateProduct(slug: string): void {
  if (slug) cache.delete(getProductCacheKey(slug));
}

/** Инвалидировать все ключи списка каталога (catalog:v1|...). */
export function invalidateCatalogList(): void {
  delByPrefix(CATALOG_KEY_PREFIX);
}

/** Инвалидировать кэш категорий. */
export function invalidateCategories(): void {
  cache.delete(CATEGORIES_KEY);
}

/** Инвалидировать блоки новинок/популярных/бестселлеров (по limit). */
export function invalidateProductBundles(): void {
  for (const key of cache.keys()) {
    if (
      key.startsWith(NEW_POPULAR_PREFIX) ||
      key.startsWith(POPULAR_PREFIX) ||
      key.startsWith(BESTSELLERS_PREFIX)
    ) {
      cache.delete(key);
    }
  }
}

/** Инвалидировать все ключи деталей товаров. Используется при полной ревалидации. */
export function invalidateAllProducts(): void {
  delByPrefix(PRODUCT_KEY_PREFIX);
}
