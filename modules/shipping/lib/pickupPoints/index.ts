/**
 * Сервис для получения пунктов выдачи
 */

import type { PickupPoint, PickupPointsQuery } from "../../types/pickup-points";
import { getCDEKPickupPoints } from "./providers/cdek";
import { getRussianPostPickupPoints } from "./providers/russianpost";

import { PICKUP_POINTS_CACHE_TTL_MS } from "@/shared/constants";

// Гибридный кеш: в production с Redis использует Redis, иначе in-memory
const cache = new Map<string, { data: PickupPoint[]; expiresAt: number }>();
const CACHE_TTL = PICKUP_POINTS_CACHE_TTL_MS;
const CACHE_TTL_SECONDS = Math.ceil(CACHE_TTL / 1000); // TTL в секундах для Redis
const REDIS_KEY_PREFIX = "pickupPoints:";

// Максимальный размер кеша для предотвращения утечек памяти
const MAX_CACHE_SIZE = parseInt(process.env.PICKUP_POINTS_MAX_CACHE_SIZE || "200", 10);

/**
 * Очищает устаревшие записи из кеша
 * Вызывается при чтении для lazy cleanup
 */
function cleanupExpiredCacheEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach(key => cache.delete(key));

  if (expiredKeys.length > 0) {
    // Логируем асинхронно чтобы не блокировать основной поток
    import("@/shared/lib/logger").then(({ logger }) => {
      logger.debug(`[PickupPoints] Cleaned up ${expiredKeys.length} expired cache entries`);
    });
  }
}

/**
 * Ограничивает размер кеша, удаляя самые старые записи
 */
function enforceCacheSizeLimit(): void {
  if (cache.size <= MAX_CACHE_SIZE) return;

  const entries = Array.from(cache.entries());
  // Сортируем по времени истечения (самые старые первыми)
  entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);

  const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE + 10); // Удаляем с запасом
  toRemove.forEach(([key]) => cache.delete(key));

  if (toRemove.length > 0) {
    // Логируем асинхронно чтобы не блокировать основной поток
    import("@/shared/lib/logger").then(({ logger }) => {
      logger.info(`[PickupPoints] Enforced cache size limit, removed ${toRemove.length} entries`);
    });
  }
}

function getCacheKey(query: PickupPointsQuery): string {
  const parts = [
    query.provider,
    query.city || "",
    query.cityCode || "",
    query.q || "",
    query.lat?.toString() || "",
    query.lon?.toString() || "",
  ];
  return parts.join("|");
}

/**
 * Получает пункты выдачи по запросу
 */
export async function getPickupPoints(
  query: PickupPointsQuery,
): Promise<PickupPoint[]> {
  const cacheKey = getCacheKey(query);
  const redisKey = REDIS_KEY_PREFIX + cacheKey;

  // Гибридная логика: сначала проверяем Redis (если доступен), затем in-memory
  if (process.env.REDIS_URL) {
    try {
      const { redisGet } = await import("@/shared/lib/redis");
      const redisCached = await redisGet<PickupPoint[]>(redisKey);
      if (redisCached && redisCached.length > 0) {
        cache.set(cacheKey, { data: redisCached, expiresAt: Date.now() + CACHE_TTL });
        return redisCached;
      }
    } catch {
      // При ошибке Redis продолжаем с in-memory
    }
  }

  // Проверяем in-memory кеш (пустые массивы не считаем валидным кэшем)
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && cached.data.length > 0) {
    return cached.data;
  }

  // Очищаем устаревшие записи при каждом чтении (lazy cleanup)
  cleanupExpiredCacheEntries();

  let points: PickupPoint[] = [];

  try {
    if (query.provider === "cdek") {
      points = await getCDEKPickupPoints(
        query.cityCode,
        query.city,
        query.lat,
        query.lon,
        query.limit || 50,
      );
    } else if (query.provider === "russianpost") {
      points = await getRussianPostPickupPoints(
        query.city || "",
        query.q,
        query.limit || 50,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const { logger } = await import("@/shared/lib/logger");
    logger.error(`[PickupPoints] Error getting ${query.provider} points`, error, { provider: query.provider, city: query.city });

    // Для СДЕК - пробрасываем ошибку дальше, чтобы компонент мог показать понятное сообщение
    if (query.provider === "cdek" && errorMessage.includes("CDEK credentials not configured")) {
      throw error;
    }

    // Для других ошибок возвращаем пустой массив
    points = [];
  }

  // Кешируем только непустые результаты, чтобы не застревать на пустых ответах
  if (points.length > 0) {
    const expiresAt = Date.now() + CACHE_TTL;
    cache.set(cacheKey, {
      data: points,
      expiresAt,
    });

    if (process.env.REDIS_URL) {
      try {
        const { redisSet } = await import("@/shared/lib/redis");
        await redisSet(redisKey, points, CACHE_TTL_SECONDS);
      } catch {
        // Игнорируем ошибки записи в Redis
      }
    }
  }

  // Контролируем размер кеша
  enforceCacheSizeLimit();

  return points;
}
