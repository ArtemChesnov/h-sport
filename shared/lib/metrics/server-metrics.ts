/**
 * Модуль для сбора метрик сервера Node.js
 * Собирает информацию о памяти, CPU, uptime
 */

import os from "os";
import { createSafeInterval } from "../safe-interval";

export interface ServerMetricsData {
  heapUsed: number; // bytes
  heapTotal: number; // bytes
  rss: number; // bytes (Resident Set Size)
  external: number; // bytes
  cpuUser: number; // microseconds
  cpuSystem: number; // microseconds
  cpuCount: number; // количество ядер CPU
  freemem: number; // bytes (свободная память системы)
  totalmem: number; // bytes (общая память системы)
  uptime: number; // seconds
}

/**
 * Собирает текущие метрики сервера
 */
export function collectServerMetrics(): ServerMetricsData {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  const cpuUser = cpuUsage.user;
  const cpuSystem = cpuUsage.system;

  return {
    heapUsed: memoryUsage.heapUsed,
    heapTotal: memoryUsage.heapTotal,
    rss: memoryUsage.rss,
    external: memoryUsage.external,
    cpuUser,
    cpuSystem,
    cpuCount: os.cpus().length,
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    uptime,
  };
}

/**
 * Вычисляет процент использования heap памяти
 */
export function getHeapUsagePercent(metrics: ServerMetricsData): number {
  if (metrics.heapTotal === 0) return 0;
  return (metrics.heapUsed / metrics.heapTotal) * 100;
}

/**
 * Вычисляет процент свободной системной памяти
 */
export function getFreeMemPercent(metrics: ServerMetricsData): number {
  if (metrics.totalmem === 0) return 0;
  return (metrics.freemem / metrics.totalmem) * 100;
}

/**
 * Проверяет, нужно ли отправлять warning (heapUsed > 80%)
 */
export function shouldWarnHeapUsage(metrics: ServerMetricsData): boolean {
  return getHeapUsagePercent(metrics) > 80;
}

/**
 * Проверяет, нужно ли отправлять critical alert (freemem < 10%)
 */
export function shouldAlertFreeMem(metrics: ServerMetricsData): boolean {
  return getFreeMemPercent(metrics) < 10;
}

/**
 * Сохраняет метрики сервера в БД
 */
export async function recordServerMetrics(): Promise<void> {
  if (typeof window !== "undefined") return;

  try {
    const metrics = collectServerMetrics();
    const { prisma } = await import("@/prisma/prisma-client");

    await prisma.serverMetrics.create({
      data: {
        heapUsed: BigInt(metrics.heapUsed),
        heapTotal: BigInt(metrics.heapTotal),
        rss: BigInt(metrics.rss),
        external: BigInt(metrics.external),
        cpuUser: BigInt(metrics.cpuUser),
        cpuSystem: BigInt(metrics.cpuSystem),
        cpuCount: metrics.cpuCount,
        freemem: BigInt(metrics.freemem),
        totalmem: BigInt(metrics.totalmem),
        uptime: metrics.uptime,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const { logger } = await import("../logger");
      logger.warn("[ServerMetrics] Failed to record server metrics", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

// Периодическое сохранение метрик (каждые 5 минут)
if (typeof window === "undefined") {
  createSafeInterval(() => {
    recordServerMetrics().catch(() => {});
  }, 5 * 60 * 1000, "server-metrics:record");
}
