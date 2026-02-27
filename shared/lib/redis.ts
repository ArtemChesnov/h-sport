/**
 * Redis-клиент с ленивой инициализацией и безопасным fallback.
 * URL берётся из единого конфига (shared/lib/config). При отсутствии REDIS_URL возвращает null.
 */

import { env } from "@/shared/lib/config";

export interface RedisClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { EX?: number; ex?: number }) => Promise<"OK" | null>;
  del: (key: string) => Promise<number>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  disconnect?: () => Promise<void>;
}

let redisClient: RedisClient | null = null;
let initAttempted = false;
let initError: Error | null = null;

/**
 * Инициализирует Redis-клиент (ленивая инициализация)
 * Возвращает клиент или null, если Redis недоступен
 */
async function initRedisClient(): Promise<RedisClient | null> {
  // Redis доступен только на сервере
  if (typeof window !== "undefined") {
    return null;
  }

  if (initAttempted) {
    return redisClient;
  }

  initAttempted = true;

  const redisUrl = env.REDIS_URL;

  // Если REDIS_URL не задан — не подключаемся (rate-limit/кеш будут in-memory)
  if (!redisUrl) {
    return null;
  }

  try {
    // Динамический импорт redis клиента (проверяем наличие)
    // Используем стандартный node-redis клиент
    type CreateClientFunction = (options: { url: string }) => {
      connect: () => Promise<unknown>;
      on: (event: string, handler: (err: Error) => void) => void;
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<string>;
      setEx: (key: string, seconds: number, value: string) => Promise<string>;
      del: (key: string) => Promise<number>;
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<boolean>;
      ttl: (key: string) => Promise<number>;
      quit: () => Promise<void>;
    };
    let Redis: CreateClientFunction | undefined;

    try {
      // Пробуем импортировать redis (node-redis) - только на сервере
      const redisModule = await import("redis");
      // node-redis v5+ экспортирует createClient напрямую
      // Используем unknown для обхода проблем с типами
      const createClientFunc = (redisModule as unknown as { createClient?: CreateClientFunction })
        .createClient;
      Redis = createClientFunc;
    } catch {
      // Если redis не установлен, возвращаем null
      // Логируем только один раз
      const { logger } = await import("./logger");
      logger.warn(
        "[Redis] Redis client not available. Install 'redis' package to use Redis caching.",
        {
          hint: "Run: npm install redis",
        }
      );
      return null;
    }

    if (!Redis || typeof Redis !== "function") {
      return null;
    }

    // Создаём клиент (node-redis v4+)
    const client = Redis({
      url: redisUrl,
    });

    // Обработка ошибок подключения с счетчиком и порогом логирования
    let connectionErrorCount = 0;
    const ERROR_LOG_THRESHOLD = 10; // логировать каждые N ошибок
    let lastErrorLogTime = 0;
    const ERROR_LOG_INTERVAL_MS = 5 * 60 * 1000; // 5 минут

    // Единый helper для логирования всех ошибок подключения (первая сразу, последующие по порогу/интервалу)
    const logConnectionError = async (err: Error) => {
      connectionErrorCount += 1;
      const now = Date.now();
      const isFirstError = connectionErrorCount === 1;
      const shouldLog =
        isFirstError || // первая ошибка всегда логируется
        connectionErrorCount % ERROR_LOG_THRESHOLD === 0 || // каждые N ошибок
        now - lastErrorLogTime >= ERROR_LOG_INTERVAL_MS; // или каждые 5 минут

      if (shouldLog) {
        lastErrorLogTime = now;
        const { logger } = await import("./logger");
        const errorCode = (err as { code?: string }).code;
        // В development логируем как warning, если Redis не запущен (это нормально)
        if (env.NODE_ENV === "development" && errorCode === "ECONNREFUSED") {
          logger.warn("[Redis] Redis server not available, using in-memory fallback", {
            hint: "To use Redis, start a Redis server or remove REDIS_URL from .env",
            errorCount: connectionErrorCount,
          });
        } else {
          logger.error("[Redis] Connection error", err, {
            errorCount: connectionErrorCount,
          });
        }
      }
    };

    client.on("error", async (err: Error) => {
      if (!initError) {
        initError = err;
      }
      redisClient = null;
      // Все ошибки логируются через единый helper (первая сразу, последующие по порогу/интервалу)
      await logConnectionError(err);
    });

    // Подключаемся
    await client.connect();

    // Создаём обёртку с нужным интерфейсом
    const wrappedClient: RedisClient = {
      get: async (key: string) => {
        try {
          const result = await client.get(key);
          return result as string | null;
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] GET error", err, { key });
          throw err;
        }
      },
      set: async (key: string, value: string, options?: { EX?: number; ex?: number }) => {
        try {
          const ttl = options?.EX || options?.ex;
          if (ttl) {
            const result = await client.setEx(key, ttl, value);
            return result === "OK" ? ("OK" as const) : null;
          }
          const result = await client.set(key, value);
          return result === "OK" ? ("OK" as const) : null;
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] SET error", err, { key });
          throw err;
        }
      },
      del: async (key: string) => {
        try {
          return await client.del(key);
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] DEL error", err, { key });
          throw err;
        }
      },
      incr: async (key: string) => {
        try {
          return await client.incr(key);
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] INCR error", err, { key });
          throw err;
        }
      },
      expire: async (key: string, seconds: number) => {
        try {
          return (await client.expire(key, seconds)) ? 1 : 0;
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] EXPIRE error", err, { key });
          throw err;
        }
      },
      ttl: async (key: string) => {
        try {
          return await client.ttl(key);
        } catch (err) {
          const { logger } = await import("./logger");
          logger.error("[Redis] TTL error", err, { key });
          throw err;
        }
      },
      disconnect: async () => {
        try {
          await client.quit();
        } catch {
          // Игнорируем ошибки при отключении
        }
      },
    };

    redisClient = wrappedClient;
    const { logger } = await import("./logger");
    logger.info("[Redis] Connected successfully");
    // Сброс счетчика ошибок при успешном подключении
    connectionErrorCount = 0;
    lastErrorLogTime = 0;

    return redisClient;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    const { logger } = await import("./logger");
    const errorCode = (initError as { code?: string }).code;

    // Логируем ошибку при инициализации (учитываем порог/интервал, если счетчик уже определен)
    // Для ECONNREFUSED в development режиме логируем как warning (это нормально)
    if (env.NODE_ENV === "development" && errorCode === "ECONNREFUSED") {
      logger.warn("[Redis] Redis server not available, using in-memory fallback", {
        hint: "To use Redis, start a Redis server or remove REDIS_URL from .env",
      });
    } else {
      logger.warn(
        "[Redis] Failed to connect, using in-memory fallback",
        initError as unknown as Record<string, unknown>,
        {
          redisUrl: redisUrl ? "***" : undefined,
        }
      );
    }
    redisClient = null;
    return null;
  }
}

/**
 * Получает Redis-клиент (singleton)
 * Возвращает null, если Redis недоступен
 */
export async function getRedisClient(): Promise<RedisClient | null> {
  if (redisClient) {
    return redisClient;
  }

  return await initRedisClient();
}

/**
 * Синхронная проверка доступности Redis (только для проверки, не для использования)
 * Для реальной работы используйте getRedisClient()
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && initAttempted && !initError;
}

/**
 * Вспомогательные функции для работы с кэшем через Redis
 */

/**
 * Получает значение из Redis
 * @param key Ключ
 * @returns Значение или null
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    const { logger } = await import("./logger");
    logger.error("[Redis] GET error", error, { key });
    return null;
  }
}

/**
 * Сохраняет значение в Redis с TTL
 * @param key Ключ
 * @param value Значение
 * @param ttlSeconds TTL в секундах
 */
export async function redisSet<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, { EX: ttlSeconds, ex: ttlSeconds });
    return true;
  } catch (error) {
    const { logger } = await import("./logger");
    logger.error("[Redis] SET error", error, { key });
    return false;
  }
}

/**
 * Удаляет значение из Redis
 * @param key Ключ
 */
export async function redisDel(key: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    const { logger } = await import("./logger");
    logger.error("[Redis] DEL error", error, { key });
    return false;
  }
}
