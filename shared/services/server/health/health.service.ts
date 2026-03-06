/**
 * Сервис проверки здоровья и готовности приложения
 */

import { prisma } from "@/prisma/prisma-client";
import { logger } from "@/shared/lib/logger";

export type HealthCheckResult = {
  status: "ok" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
  uptime: number;
};

export type ReadinessResult = { ready: true } | { ready: false; reason: string };

/**
 * Runs full health check (DB). Uptime in seconds.
 */
export async function runHealthCheck(startTimeMs: number): Promise<HealthCheckResult> {
  const uptime = Math.floor((Date.now() - startTimeMs) / 1000);
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      timestamp,
      database: "connected",
      uptime,
    };
  } catch (err) {
    logger.warn("[Healthcheck] Database check failed", { err }, { endpoint: "/api/health" });
    return {
      status: "error",
      timestamp,
      database: "disconnected",
      uptime,
    };
  }
}

/**
 * Readiness: 200 only when DB is available.
 */
export async function runReadinessCheck(): Promise<ReadinessResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ready: true };
  } catch {
    return { ready: false, reason: "database" };
  }
}
