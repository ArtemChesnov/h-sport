/**
 * Метрики производительности (бесплатное решение)
 * Собирает метрики в памяти и предоставляет API для их получения
 */

import { API_METRICS_DB_QUERY_LIMIT } from "@/shared/constants";
import { createSafeInterval } from "../safe-interval";

interface ApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: number;
}

const apiMetrics: ApiMetric[] = [];
const MAX_METRICS = 10000; // Максимальное количество метрик в памяти

/**
 * Записывает метрику API запроса
 * Сохраняет в БД асинхронно, чтобы не блокировать запрос
 */
export async function recordApiMetric(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number
): Promise<void> {
  // Не считаем ожидаемые 401 для проверки авторизации (меньше шума в метриках и логах)
  if (
    method === "GET" &&
    statusCode === 401 &&
    (endpoint === "/api/shop/profile" || endpoint === "/api/auth/me")
  ) {
    return;
  }

  // Сохраняем в память для быстрого доступа (fallback)
  if (apiMetrics.length >= MAX_METRICS) {
    apiMetrics.shift();
  }
  apiMetrics.push({
    endpoint,
    method,
    duration,
    statusCode,
    timestamp: Date.now(),
  });

  // Сохраняем в БД асинхронно через batch систему (не блокируем запрос)
  try {
    const { addApiMetricToBuffer } = await import("./metrics-batch");
    addApiMetricToBuffer(endpoint, method, duration, statusCode);
  } catch {
    // Игнорируем ошибки импорта или БД
  }
}

/**
 * Получает расширенную статистику по API метрикам
 * Использует данные из БД для точности, память только как fallback
 */
export async function getApiMetrics(
  timeWindowMs: number = 60 * 60 * 1000 // Последний час по умолчанию
): Promise<{
  totalRequests: number;
  averageResponseTime: number;
  requestsPerEndpoint: Record<string, number>;
  errorRate: number;
  statusCodes: Record<number, number>;
  p50: number; // 50-й перцентиль времени ответа
  p95: number; // 95-й перцентиль времени ответа
  p99: number; // 99-й перцентиль времени ответа
  requestsPerMinute: number; // Запросов в минуту
  requestsPerMethod: Record<string, number>; // Запросы по HTTP методам
  requestsPerSecond: number; // Запросов в секунду
  slowestEndpoints: Array<{ endpoint: string; method: string; avgDuration: number; count: number }>; // Топ медленных
  timeSeries: Array<{ timestamp: number; requests: number; avgDuration: number; errors: number }>; // Временной ряд
  previousPeriod?: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  }; // Сравнение с предыдущим периодом
}> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeWindowMs);

  let recentMetrics: ApiMetric[] = [];

  // Пытаемся получить данные из БД (более точные и полные)
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const dbMetrics = await prisma.apiMetric.findMany({
      where: {
        createdAt: {
          gte: cutoff,
          lte: now,
        },
      },
      orderBy: { createdAt: "desc" },
      take: API_METRICS_DB_QUERY_LIMIT,
    });

    if (dbMetrics.length >= API_METRICS_DB_QUERY_LIMIT) {
      const { logger } = await import("../logger");
      logger.warn("[Metrics] API metrics query hit limit; data may be truncated", {
        limit: API_METRICS_DB_QUERY_LIMIT,
        timeWindowMs,
      });
    }

    // Конвертируем данные из БД в формат ApiMetric
    recentMetrics = dbMetrics.map((m) => ({
      endpoint: m.endpoint,
      method: m.method,
      duration: m.duration,
      statusCode: m.statusCode,
      timestamp: m.createdAt.getTime(),
    }));
  } catch {
    // Если БД недоступна, используем данные из памяти как fallback
    const memoryCutoff = Date.now() - timeWindowMs;
    recentMetrics = apiMetrics.filter((m) => m.timestamp >= memoryCutoff);
  }

  // Если данных из БД нет, используем память
  if (recentMetrics.length === 0) {
    const memoryCutoff = Date.now() - timeWindowMs;
    recentMetrics = apiMetrics.filter((m) => m.timestamp >= memoryCutoff);
  }

  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      requestsPerEndpoint: {},
      errorRate: 0,
      statusCodes: {},
      p50: 0,
      p95: 0,
      p99: 0,
      requestsPerMinute: 0,
      requestsPerMethod: {},
      requestsPerSecond: 0,
      slowestEndpoints: [],
      timeSeries: [],
    };
  }

  const totalRequests = recentMetrics.length;
  const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
  const averageResponseTime = totalDuration / totalRequests;

  // Вычисляем перцентили времени ответа
  const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

  // Запросов в минуту и секунду
  const minutes = timeWindowMs / (60 * 1000);
  const seconds = timeWindowMs / 1000;
  const requestsPerMinute = minutes > 0 ? Math.round(totalRequests / minutes) : 0;
  const requestsPerSecond = seconds > 0 ? Number((totalRequests / seconds).toFixed(2)) : 0;

  // Группировка метрик
  const requestsPerEndpoint: Record<string, { count: number; totalDuration: number }> = {};
  const requestsPerMethod: Record<string, number> = {};
  const statusCodes: Record<number, number> = {};
  let errorCount = 0;

  // Error rate считаем только по серверным ошибкам (5xx). 4xx (401, 404 и т.д.) — ожидаемое поведение.
  for (const metric of recentMetrics) {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!requestsPerEndpoint[key]) {
      requestsPerEndpoint[key] = { count: 0, totalDuration: 0 };
    }
    requestsPerEndpoint[key].count++;
    requestsPerEndpoint[key].totalDuration += metric.duration;

    requestsPerMethod[metric.method] = (requestsPerMethod[metric.method] || 0) + 1;
    statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;

    if (metric.statusCode >= 500) {
      errorCount++;
    }
  }

  // Топ медленных endpoints (по среднему времени)
  const slowestEndpoints = Object.entries(requestsPerEndpoint)
    .map(([key, data]) => {
      const [method, ...endpointParts] = key.split(" ");
      const endpoint = endpointParts.join(" ");
      return {
        endpoint,
        method,
        avgDuration: Math.round(data.totalDuration / data.count),
        count: data.count,
      };
    })
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10);

  // Временной ряд (группировка по интервалам)
  // Адаптивные интервалы в зависимости от периода для оптимальной детализации
  const intervalMs =
    timeWindowMs <= 15 * 60 * 1000
      ? 60 * 1000 // 1 минута для <= 15 минут
      : timeWindowMs <= 6 * 60 * 60 * 1000
        ? 5 * 60 * 1000 // 5 минут для <= 6 часов
        : timeWindowMs <= 24 * 60 * 60 * 1000
          ? 60 * 60 * 1000 // 1 час для <= 24 часов
          : timeWindowMs <= 7 * 24 * 60 * 60 * 1000
            ? 6 * 60 * 60 * 1000 // 6 часов для <= 7 дней
            : 24 * 60 * 60 * 1000; // 1 день для > 7 дней (30 дней)
  const timeSeriesMap = new Map<
    number,
    { requests: number; totalDuration: number; errors: number }
  >();

  for (const metric of recentMetrics) {
    const intervalStart = Math.floor(metric.timestamp / intervalMs) * intervalMs;
    if (!timeSeriesMap.has(intervalStart)) {
      timeSeriesMap.set(intervalStart, { requests: 0, totalDuration: 0, errors: 0 });
    }
    const bucket = timeSeriesMap.get(intervalStart)!;
    bucket.requests++;
    bucket.totalDuration += metric.duration;
    if (metric.statusCode >= 500) {
      bucket.errors++;
    }
  }

  const timeSeries = Array.from(timeSeriesMap.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      requests: data.requests,
      avgDuration: Math.round(data.totalDuration / data.requests) || 0,
      errors: data.errors,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Сравнение с предыдущим периодом
  let previousPeriod:
    | { totalRequests: number; averageResponseTime: number; errorRate: number }
    | undefined;
  try {
    const previousCutoff = new Date(cutoff.getTime() - timeWindowMs);
    const { prisma } = await import("@/prisma/prisma-client");
    const previousMetrics = await prisma.apiMetric.findMany({
      where: {
        createdAt: {
          gte: previousCutoff,
          lt: cutoff,
        },
      },
      orderBy: { createdAt: "desc" },
      take: API_METRICS_DB_QUERY_LIMIT,
    });

    if (previousMetrics.length > 0) {
      const prevTotal = previousMetrics.length;
      const prevTotalDuration = previousMetrics.reduce((sum, m) => sum + m.duration, 0);
      const prevAvgDuration = prevTotalDuration / prevTotal;
      const prevErrors = previousMetrics.filter((m) => m.statusCode >= 500).length;

      previousPeriod = {
        totalRequests: prevTotal,
        averageResponseTime: Math.round(prevAvgDuration),
        errorRate: (prevErrors / prevTotal) * 100,
      };
    }
  } catch {
    // Игнорируем ошибки получения предыдущего периода
  }

  // Преобразуем requestsPerEndpoint в старый формат для совместимости
  const requestsPerEndpointFlat: Record<string, number> = {};
  for (const [key, data] of Object.entries(requestsPerEndpoint)) {
    requestsPerEndpointFlat[key] = data.count;
  }

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    requestsPerEndpoint: requestsPerEndpointFlat,
    errorRate: (errorCount / totalRequests) * 100,
    statusCodes,
    p50: Math.round(p50),
    p95: Math.round(p95),
    p99: Math.round(p99),
    requestsPerMinute,
    requestsPerMethod,
    requestsPerSecond,
    slowestEndpoints,
    timeSeries,
    previousPeriod,
  };
}

/**
 * Очищает старые метрики из памяти
 */
export function clearOldMetrics(olderThanMs: number = 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - olderThanMs;
  const index = apiMetrics.findIndex((m) => m.timestamp >= cutoff);
  if (index > 0) {
    apiMetrics.splice(0, index);
  }
}

/**
 * Очищает старые метрики из БД
 * Оптимальный период: 30 дней для API метрик (позволяет просматривать историю за большие периоды)
 */
export async function clearOldMetricsFromDb(olderThanDays: number = 30): Promise<void> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    await prisma.apiMetric.deleteMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
    });
  } catch {
    // Игнорируем ошибки БД
  }
}

// Периодическая очистка старых метрик из памяти (раз в час)
createSafeInterval(
  () => {
    clearOldMetrics();
  },
  60 * 60 * 1000,
  "metrics:cleanup"
);

// Периодическая очистка старых метрик из БД (раз в день)
createSafeInterval(
  () => {
    clearOldMetricsFromDb(30).catch(() => {
      // Игнорируем ошибки
    });
  },
  24 * 60 * 60 * 1000,
  "metrics:db-cleanup"
);
