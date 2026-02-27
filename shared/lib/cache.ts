/**
 * Гибридный кэш с поддержкой Redis
 * В production с Redis использует Redis для горизонтального масштабирования
 * В dev или при отсутствии Redis использует in-memory кэш
 *
 * Префикс для Redis ключей: "cache:"
 */

import { CACHE_CLEANUP_INTERVAL_MS } from "@/shared/constants";
import { env } from "@/shared/lib/config/env";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

// Используем globalThis для защиты от HMR дублирования
const globalForCache = globalThis as typeof globalThis & {
  __cacheStore?: Map<string, CacheEntry<unknown>>;
  __cacheCleanupRegistered?: boolean;
};

// Глобальный cache store (защищён от HMR)
const cache: Map<string, CacheEntry<unknown>> = globalForCache.__cacheStore ||
(globalForCache.__cacheStore = new Map());

const MAX_CACHE_SIZE = 10000; // Максимальное количество записей
const CLEANUP_INTERVAL_MS = CACHE_CLEANUP_INTERVAL_MS;
const ACCESS_COUNT_THRESHOLD = 5; // Минимальное количество обращений для сохранения при очистке
const REDIS_KEY_PREFIX = "cache:";

/**
 * Очистка устаревших записей и LRU эвiction
 */
function cleanup() {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  const activeEntries: Array<{ key: string; lastAccessed: number }> = [];

  // Собираем устаревшие записи и активные
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      entriesToDelete.push(key);
    } else {
      activeEntries.push({ key, lastAccessed: entry.lastAccessed });
    }
  }

  // Удаляем устаревшие
  for (const key of entriesToDelete) {
    cache.delete(key);
  }

  // Если кэш все еще слишком большой, удаляем наименее используемые записи
  if (cache.size > MAX_CACHE_SIZE) {
    // Сортируем по последнему обращению и количеству обращений
    activeEntries.sort((a, b) => {
      const entryA = cache.get(a.key) as CacheEntry<unknown>;
      const entryB = cache.get(b.key) as CacheEntry<unknown>;

      // Сначала удаляем записи с малым количеством обращений
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

      // Затем по последнему обращению (LRU)
      return a.lastAccessed - b.lastAccessed;
    });

    // Удаляем наименее используемые записи
    const toRemove = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove && i < activeEntries.length; i++) {
      cache.delete(activeEntries[i].key);
    }
  }
}

// Периодическая очистка (с .unref() чтобы не блокировать завершение процесса)
// Защита от HMR дублирования через globalThis
if (typeof setInterval !== "undefined" && !globalForCache.__cacheCleanupRegistered) {
  globalForCache.__cacheCleanupRegistered = true;
  const cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MS);
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref(); // Позволяет процессу завершиться без ожидания таймера
  }
}

/**
 * Получает значение из кэша (синхронно, in-memory)
 * Для сохранения backwards compatibility с существующим кодом
 * При наличии REDIS_URL также пытается прочитать из Redis в фоне (не блокируя)
 */
export function get<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    // При наличии REDIS_URL и на сервере: асинхронно проверяем Redis (не блокируя)
    if (typeof window === "undefined" && env.REDIS_URL) {
      // Не блокируем, просто запускаем в фоне
      getFromRedis(key).catch(() => {
        // Игнорируем ошибки фонового чтения
      });
    }
    return null;
  }

  const now = Date.now();
  if (entry.expiresAt < now) {
    cache.delete(key);
    return null;
  }

  // Обновляем статистику доступа
  entry.accessCount += 1;
  entry.lastAccessed = now;

  return entry.value;
}

/**
 * Асинхронно получает значение из кэша с приоритетом Redis
 * Сначала проверяет Redis (если доступен), затем in-memory кэш
 * Используется в API routes для эффективного кеширования
 */
export async function getAsync<T>(key: string): Promise<T | null> {
  // Redis доступен только на сервере
  if (typeof window === "undefined" && env.REDIS_URL) {
    try {
      const redisValue = await getFromRedis<T>(key);
      if (redisValue !== null) {
        // Также сохраняем в in-memory для быстрого доступа
        const ttl = await getRedisTtl(key);
        if (ttl > 0) {
          set(key, redisValue, ttl * 1000);
        }
        return redisValue;
      }
    } catch {
      // При ошибке Redis продолжаем с in-memory
    }
  }

  // Fallback на in-memory кэш
  return get<T>(key);
}

/**
 * Получает TTL ключа из Redis (используется внутри)
 */
async function getRedisTtl(key: string): Promise<number> {
  if (typeof window !== "undefined") {
    return 0;
  }

  try {
    const { getRedisClient } = await import("./redis");
    const client = await getRedisClient();
    if (!client) {
      return 0;
    }
    return await client.ttl(REDIS_KEY_PREFIX + key);
  } catch {
    return 0;
  }
}

/**
 * Асинхронное чтение из Redis (используется внутри, только на сервере)
 */
async function getFromRedis<T>(key: string): Promise<T | null> {
  // Redis доступен только на сервере
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const { redisGet } = await import("./redis");
    return await redisGet<T>(REDIS_KEY_PREFIX + key);
  } catch {
    return null;
  }
}

/**
 * Сохраняет значение в кэш
 * Всегда сохраняет в in-memory (синхронно)
 * При наличии REDIS_URL также сохраняет в Redis (асинхронно, в фоне)
 */
export function set<T>(key: string, value: T, ttlMs: number): void {
  // Если кэш переполнен, делаем очистку перед добавлением
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanup();
  }

  const now = Date.now();
  cache.set(key, {
    value,
    expiresAt: now + ttlMs,
    accessCount: 0,
    lastAccessed: now,
  });

  // При наличии REDIS_URL и на сервере: также пишем в Redis (не блокируя)
  if (typeof window === "undefined" && env.REDIS_URL) {
    setToRedis(key, value, Math.ceil(ttlMs / 1000)).catch(() => {
      // Игнорируем ошибки фоновой записи
    });
  }
}

/**
 * Асинхронная запись в Redis (используется внутри, только на сервере)
 */
async function setToRedis<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  // Redis доступен только на сервере
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const { redisSet } = await import("./redis");
    await redisSet(REDIS_KEY_PREFIX + key, value, ttlSeconds);
  } catch {
    // Игнорируем ошибки
  }
}

/**
 * Получает статистику кэша
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
} {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}

/**
 * Удаляет значение из кэша (синхронно, только in-memory)
 */
export function del(key: string): void {
  cache.delete(key);
}

/**
 * Асинхронно удаляет значение из кэша (Redis + in-memory)
 */
export async function delAsync(key: string): Promise<void> {
  // Удаляем из in-memory
  cache.delete(key);

  // Удаляем из Redis (если доступен)
  if (typeof window === "undefined" && env.REDIS_URL) {
    try {
      const { redisDel } = await import("./redis");
      await redisDel(REDIS_KEY_PREFIX + key);
    } catch {
      // Игнорируем ошибки
    }
  }
}

/**
 * Очищает весь кэш
 */
export function clear(): void {
  cache.clear();
}
