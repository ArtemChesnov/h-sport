import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  _slowQueryListenerAttached?: boolean;
};

/**
 * Настройка логов Prisma.
 *
 * - Логирование query событий ВСЕГДА включено для отслеживания медленных запросов
 * - В development дополнительно выводятся info логи
 * - Если нужно принудительно отключить логирование медленных запросов:
 *   SLOW_QUERY_LOGGING="false"
 */
const isProd = process.env.NODE_ENV === "production";
const envFlag = (process.env.PRISMA_LOG_QUERIES ?? "").toLowerCase();
const slowQueryLoggingEnabled =
  (process.env.SLOW_QUERY_LOGGING ?? "true").toLowerCase() !== "false";

const shouldLogQueries =
  !isProd &&
  (envFlag === ""
    ? true // dev-default
    : envFlag === "true");

/**
 * Настройка логирования Prisma для логирования медленных запросов.
 * Используем событие 'query' для перехвата SQL-запросов.
 *
 * ВАЖНО: emit: "event" для query включен всегда для работы логирования медленных запросов
 */
const logConfig: Array<"info" | "warn" | "error" | { emit: "event"; level: "query" }> =
  slowQueryLoggingEnabled
    ? [
        { emit: "event", level: "query" },
        ...(shouldLogQueries ? (["info"] as const) : []),
        "warn",
        "error",
      ]
    : ["warn", "error"];

/**
 * Настройка connection pooling для PostgreSQL.
 *
 * Если DATABASE_URL указывает на Prisma Accelerate / Data Proxy
 * (db.prisma.io, prisma+postgres://, pool=true), то параметры
 * connection_limit / pool_timeout НЕ добавляются — пулинг
 * управляется на стороне прокси. Добавление этих параметров
 * может вызвать конфликты и исчерпание пула.
 *
 * Для прямых подключений к PostgreSQL параметры добавляются как прежде.
 */
function isPrismaAccelerateUrl(url: string): boolean {
  return (
    url.includes("db.prisma.io") ||
    url.includes("pool=true") ||
    url.startsWith("prisma+postgres://") ||
    url.startsWith("prisma://")
  );
}

function buildDatabaseUrlWithPooling(baseUrl: string): string {
  // Не трогаем URL для Prisma Accelerate / Data Proxy
  if (isPrismaAccelerateUrl(baseUrl)) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);

    const defaultPoolMax = isProd ? 15 : 5;
    const defaultPoolTimeoutMs = isProd ? 30000 : 10000;

    const poolMax = process.env.DB_POOL_MAX
      ? parseInt(process.env.DB_POOL_MAX, 10)
      : defaultPoolMax;
    const poolTimeoutMs = process.env.DB_POOL_TIMEOUT_MS
      ? parseInt(process.env.DB_POOL_TIMEOUT_MS, 10)
      : defaultPoolTimeoutMs;

    const poolTimeoutSec = Math.max(1, Math.floor(poolTimeoutMs / 1000));

    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", String(poolMax));
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", String(poolTimeoutSec));
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "10");
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}

// Строим URL с параметрами пула без мутации process.env — передаём в PrismaClient через datasources
const databaseUrl = process.env.DATABASE_URL
  ? buildDatabaseUrlWithPooling(process.env.DATABASE_URL)
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
    ...(databaseUrl && { datasources: { db: { url: databaseUrl } } }),
  });

// Инициализируем логирование медленных запросов (асинхронно, один раз на процесс)
if (typeof window === "undefined") {
  import("@/shared/lib/metrics")
    .then(({ logSlowQuery, getSlowQueryThreshold }) => {
      if (globalForPrisma._slowQueryListenerAttached) return;
      globalForPrisma._slowQueryListenerAttached = true;

      const threshold = getSlowQueryThreshold();

      prisma.$on(
        "query" as never,
        async (event: { query: string; duration: number; params: string; target: string }) => {
          const duration = event.duration;
          const query = (event.query || "").trim().toUpperCase();
          if (query === "COMMIT") return;

          if (duration > threshold) {
            logSlowQuery({
              query: event.query,
              duration,
            }).catch(() => {});
          }
        }
      );

      const emitter = (prisma as unknown as { _engine?: { setMaxListeners?: (n: number) => void } })
        ._engine;
      if (emitter?.setMaxListeners) emitter.setMaxListeners(20);
    })
    .catch(() => {});
}

if (!isProd) globalForPrisma.prisma = prisma;
