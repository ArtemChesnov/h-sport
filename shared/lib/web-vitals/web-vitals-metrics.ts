/**
 * Web Vitals метрики производительности
 * Собирает метрики Core Web Vitals с клиента и сохраняет в БД
 */

import { createSafeInterval } from "../safe-interval";

/**
 * Получает статистику по Web Vitals метрикам
 */
export async function getWebVitalsMetrics(timeWindowMs: number = 24 * 60 * 60 * 1000) {
  // Вычисляем время с небольшим запасом вперед, чтобы включить метрики, которые могут быть записаны
  // с небольшой задержкой из-за batch системы
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeWindowMs);
  // Добавляем небольшой буфер (5 минут) для учета задержек записи
  const upperBound = new Date(now.getTime() + 5 * 60 * 1000);

  try {
    const { prisma } = await import("@/prisma/prisma-client");

    const metrics = await prisma.webVitalsMetric.findMany({
      where: {
        createdAt: {
          gte: cutoff,
          lte: upperBound, // Включаем небольшой буфер для учета задержек batch записи
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10000, // Ограничение для производительности
    });

    // Группируем по типу метрики
    const metricsByType: Record<string, number[]> = {};
    const metricsByUrl: Record<string, Record<string, number[]>> = {};

    for (const metric of metrics) {
      if (!metricsByType[metric.name]) {
        metricsByType[metric.name] = [];
      }
      metricsByType[metric.name].push(metric.value);

      if (!metricsByUrl[metric.url]) {
        metricsByUrl[metric.url] = {};
      }
      if (!metricsByUrl[metric.url][metric.name]) {
        metricsByUrl[metric.url][metric.name] = [];
      }
      metricsByUrl[metric.url][metric.name].push(metric.value);
    }

    // Вычисляем статистику для каждого типа метрики
    const statsByType: Record<
      string,
      {
        count: number;
        avg: number;
        min: number;
        max: number;
        p50: number;
        p75: number;
        p95: number;
        p99: number;
      }
    > = {};

    for (const [name, values] of Object.entries(metricsByType)) {
      const sorted = [...values].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const avg = sum / count;

      statsByType[name] = {
        count,
        avg: Math.round(avg * 100) / 100,
        min: sorted[0] || 0,
        max: sorted[count - 1] || 0,
        p50: sorted[Math.floor(count * 0.5)] || 0,
        p75: sorted[Math.floor(count * 0.75)] || 0,
        p95: sorted[Math.floor(count * 0.95)] || 0,
        p99: sorted[Math.floor(count * 0.99)] || 0,
      };
    }

    // Временной ряд (группировка по интервалам)
    const intervalMs = timeWindowMs <= 4 * 60 * 60 * 1000 ? 5 * 60 * 1000 : // 5 минут для <= 4 часов
                        15 * 60 * 1000; // 15 минут для большего периода
    const timeSeriesMap = new Map<
      number,
      Record<string, { count: number; totalValue: number }>
    >();

    for (const metric of metrics) {
      const intervalStart = Math.floor(metric.createdAt.getTime() / intervalMs) * intervalMs;
      if (!timeSeriesMap.has(intervalStart)) {
        timeSeriesMap.set(intervalStart, {});
      }
      const bucket = timeSeriesMap.get(intervalStart)!;
      if (!bucket[metric.name]) {
        bucket[metric.name] = { count: 0, totalValue: 0 };
      }
      bucket[metric.name].count++;
      bucket[metric.name].totalValue += metric.value;
    }

    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([timestamp, data]) => ({
        timestamp,
        metrics: Object.entries(data).map(([name, stats]) => ({
          name,
          avgValue: Math.round((stats.totalValue / stats.count) * 100) / 100,
          count: stats.count,
        })),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Топ страниц по метрикам
    const topPages: Array<{ url: string; metrics: Record<string, number> }> = [];
    for (const [url, urlMetrics] of Object.entries(metricsByUrl)) {
      const urlStats: Record<string, number> = {};
      for (const [name, values] of Object.entries(urlMetrics)) {
        const sorted = [...values].sort((a, b) => a - b);
        urlStats[name] = Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 100) / 100;
      }
      topPages.push({ url, metrics: urlStats });
    }

    // Сортируем по LCP (если есть), иначе по количеству метрик
    topPages.sort((a, b) => {
      const aLcp = a.metrics.LCP || 0;
      const bLcp = b.metrics.LCP || 0;
      if (aLcp !== bLcp) return bLcp - aLcp;
      return Object.keys(b.metrics).length - Object.keys(a.metrics).length;
    });

    return {
      period: {
        from: cutoff.toISOString(),
        to: now.toISOString(),
        windowMs: timeWindowMs,
      },
      totalMetrics: metrics.length,
      statsByType,
      timeSeries,
      topPages: topPages.slice(0, 10),
    };
  } catch {
    // Если БД недоступна, возвращаем пустые данные
    return {
      period: {
        from: cutoff.toISOString(),
        to: now.toISOString(),
        windowMs: timeWindowMs,
      },
      totalMetrics: 0,
      statsByType: {},
      timeSeries: [],
      topPages: [],
    };
  }
}

/**
 * Очищает старые Web Vitals метрики из БД
 * Оптимальный период: 30 дней (достаточно для анализа, но не перегружает БД)
 */
export async function clearOldWebVitalsMetricsFromDb(olderThanDays: number = 30): Promise<void> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    await prisma.webVitalsMetric.deleteMany({
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

// Периодическая очистка старых метрик из БД (раз в день)
createSafeInterval(() => {
  clearOldWebVitalsMetricsFromDb(30).catch(() => {
    // Игнорируем ошибки
  });
}, 24 * 60 * 60 * 1000, "web-vitals-metrics:db-cleanup");
