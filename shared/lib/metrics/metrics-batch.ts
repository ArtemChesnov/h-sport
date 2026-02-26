/**
 * Система batch inserts для метрик
 * Накапливает метрики в буфере и периодически записывает их в БД пачками
 */

import { createSafeInterval } from "../safe-interval";

export interface PendingApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
}

export interface PendingWebVitalsMetric {
  name: string;
  value: number;
  delta: number | null;
  metricId: string | null;
  url: string;
}

const apiMetricsBuffer: PendingApiMetric[] = [];
const webVitalsMetricsBuffer: PendingWebVitalsMetric[] = [];

const BATCH_SIZE = 50;
export const MAX_BUFFER_SIZE = parseInt(process.env.METRICS_BATCH_MAX_BUFFER_SIZE || "1000", 10);

export function applyBoundsOnAdd<T>(buffer: T[], item: T, maxSize: number): number {
  let evicted = 0;
  if (buffer.length >= maxSize) {
    buffer.shift();
    evicted = 1;
  }
  buffer.push(item);
  return evicted;
}

export function applyBoundsOnReturn<T>(buffer: T[], itemsToReturn: T[], maxSize: number): number {
  if (buffer.length > 0) {
    return itemsToReturn.length;
  }
  const spaceAvailable = maxSize;
  const itemsToAdd = itemsToReturn.slice(0, spaceAvailable);
  const dropped = itemsToReturn.length - itemsToAdd.length;
  buffer.unshift(...itemsToAdd);
  return dropped;
}

export function getBufferSizes(): { api: number; webVitals: number } {
  return {
    api: apiMetricsBuffer.length,
    webVitals: webVitalsMetricsBuffer.length,
  };
}

export function __resetBuffersForTesting(): void {
  apiMetricsBuffer.length = 0;
  webVitalsMetricsBuffer.length = 0;
}

const FLUSH_INTERVAL_MS = parseInt(process.env.METRICS_BATCH_FLUSH_INTERVAL_MS || "30000", 10);
const WEB_VITALS_FLUSH_INTERVAL_MS = parseInt(process.env.WEB_VITALS_BATCH_FLUSH_INTERVAL_MS || "60000", 10);
let lastWebVitalsFlush = Date.now();

export function addApiMetricToBuffer(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
): void {
  if (apiMetricsBuffer.length >= MAX_BUFFER_SIZE) {
    apiMetricsBuffer.shift();
  }
  apiMetricsBuffer.push({ endpoint, method, duration, statusCode });
  if (apiMetricsBuffer.length >= BATCH_SIZE) {
    flushApiMetrics().catch(() => {});
  }
}

export function addWebVitalsMetricToBuffer(
  name: string,
  value: number,
  delta: number | null,
  metricId: string | null,
  url: string,
): void {
  if (webVitalsMetricsBuffer.length >= MAX_BUFFER_SIZE) {
    webVitalsMetricsBuffer.shift();
  }
  webVitalsMetricsBuffer.push({ name, value, delta, metricId, url });
  const now = Date.now();
  const timeSinceLastFlush = now - lastWebVitalsFlush;
  if (webVitalsMetricsBuffer.length >= BATCH_SIZE || timeSinceLastFlush >= WEB_VITALS_FLUSH_INTERVAL_MS) {
    lastWebVitalsFlush = now;
    flushWebVitalsMetrics().catch(() => {});
  }
}

async function flushApiMetrics(): Promise<void> {
  if (apiMetricsBuffer.length === 0) return;
  const metricsToFlush = apiMetricsBuffer.splice(0, BATCH_SIZE);
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const { retryWithBackoff } = await import("@/shared/lib/retry");
    await retryWithBackoff(
      () =>
        prisma.apiMetric.createMany({
          data: metricsToFlush.map((m) => ({
            endpoint: m.endpoint,
            method: m.method,
            duration: m.duration,
            statusCode: m.statusCode,
          })),
          skipDuplicates: true,
        }),
      {
        maxRetries: 2,
        initialDelay: 300,
        shouldRetry: (error) => {
          if (error && typeof error === "object" && "code" in error) {
            return String(error.code).startsWith("P10");
          }
          return false;
        },
      },
    );
  } catch {
    if (apiMetricsBuffer.length === 0 && metricsToFlush.length > 0) {
      const metricsToReturn = metricsToFlush.slice(0, MAX_BUFFER_SIZE);
      apiMetricsBuffer.unshift(...metricsToReturn);
      if (metricsToFlush.length > MAX_BUFFER_SIZE) {
        const { logger } = await import("../logger");
        logger.warn(`[metrics-batch] Dropped ${metricsToFlush.length - MAX_BUFFER_SIZE} API metrics due to buffer overflow`);
      }
    }
  }
}

async function flushWebVitalsMetrics(): Promise<void> {
  if (webVitalsMetricsBuffer.length === 0) return;
  const metricsToFlush = webVitalsMetricsBuffer.splice(0, BATCH_SIZE);
  lastWebVitalsFlush = Date.now();
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const { retryWithBackoff } = await import("@/shared/lib/retry");
    await retryWithBackoff(
      () =>
        prisma.webVitalsMetric.createMany({
          data: metricsToFlush.map((m) => ({
            name: m.name,
            value: m.value,
            delta: m.delta,
            metricId: m.metricId,
            url: m.url,
          })),
          skipDuplicates: true,
        }),
      {
        maxRetries: 2,
        initialDelay: 300,
        shouldRetry: (error) => {
          if (error && typeof error === "object" && "code" in error) {
            return String(error.code).startsWith("P10");
          }
          if (error && typeof error === "object" && "message" in error) {
            const message = String((error as { message: string }).message);
            return (
              message.includes("Server has closed the connection") ||
              message.includes("connection closed") ||
              message.includes("Can't reach database server")
            );
          }
          return false;
        },
      },
    );
  } catch (error) {
    if (webVitalsMetricsBuffer.length === 0 && metricsToFlush.length > 0) {
      const metricsToReturn = metricsToFlush.slice(0, MAX_BUFFER_SIZE);
      webVitalsMetricsBuffer.unshift(...metricsToReturn);
      if (metricsToFlush.length > MAX_BUFFER_SIZE) {
        const { logger } = await import("../logger");
        logger.warn(`[metrics-batch] Dropped ${metricsToFlush.length - MAX_BUFFER_SIZE} Web Vitals metrics due to buffer overflow`);
      }
    }
    const { logger } = await import("@/shared/lib/logger");
    const isConnectionError =
      error &&
      typeof error === "object" &&
      "code" in error &&
      String((error as { code: string }).code).startsWith("P10");
    if (!isConnectionError) {
      logger.error("Failed to flush Web Vitals metrics", error);
    }
  }
}

async function logFlushError(type: string, error: unknown) {
  try {
    const { logger } = await import("@/shared/lib/logger");
    logger.error(`Failed to flush ${type} metrics`, error);
  } catch {
    console.error(`Failed to flush ${type} metrics:`, error);
  }
}

async function performGracefulShutdown(signal: string) {
  try {
    const { logger } = await import("@/shared/lib/logger");
    logger.info(`Received ${signal}, flushing remaining metrics...`);
    await Promise.allSettled([flushApiMetrics(), flushWebVitalsMetrics()]);
    logger.info("Successfully flushed remaining metrics before shutdown");
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error(`Failed to flush metrics during shutdown:`, error);
  }
}

const globalForShutdown = globalThis as typeof globalThis & {
  __metricsBatchShutdownRegistered?: boolean;
};

if (typeof window === "undefined") {
  createSafeInterval(() => {
    flushApiMetrics().catch((error) => logFlushError("API", error));
    const now = Date.now();
    if (now - lastWebVitalsFlush >= WEB_VITALS_FLUSH_INTERVAL_MS) {
      flushWebVitalsMetrics().catch((error) => logFlushError("Web Vitals", error));
    }
  }, FLUSH_INTERVAL_MS, "metrics-batch:flush");

  if (!globalForShutdown.__metricsBatchShutdownRegistered) {
    globalForShutdown.__metricsBatchShutdownRegistered = true;
    const handleShutdown = (signal: string) => {
      performGracefulShutdown(signal).catch((error) => {
        console.error(`[metrics-batch] Shutdown flush failed:`, error);
      });
      const exitTimeout = setTimeout(() => {
        process.exit(0);
      }, 2000);
      if (exitTimeout && typeof exitTimeout.unref === "function") {
        exitTimeout.unref();
      }
    };
    process.once("SIGTERM", () => handleShutdown("SIGTERM"));
    process.once("SIGINT", () => handleShutdown("SIGINT"));
  }
}
