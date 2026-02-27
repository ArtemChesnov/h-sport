/**
 * Сервис проверки здоровья и готовности приложения
 */

import { prisma } from "@/prisma/prisma-client";
import { env } from "@/shared/lib/config/env";
import { getRedisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/lib/logger";

export type HealthCheckResult = {
  status: "ok" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
  redis: "ok" | "error" | "disabled";
  uptime: number;
};

export type ReadinessResult = { ready: true } | { ready: false; reason: string };

/**
 * Проверка доступности Redis. Возвращает "disabled", если REDIS_URL не задан.
 */
export async function checkRedis(): Promise<"ok" | "error" | "disabled"> {
  if (!env.REDIS_URL) return "disabled";
  try {
    const client = await getRedisClient();
    if (!client) return "error";
    await client.get("__health_check__");
    return "ok";
  } catch (error) {
    logger.warn("[Healthcheck] Redis check failed", { error }, { endpoint: "/api/health" });
    return "error";
  }
}

/**
 * Runs full health check (DB + Redis). Uptime in seconds.
 */
export async function runHealthCheck(startTimeMs: number): Promise<HealthCheckResult> {
  const uptime = Math.floor((Date.now() - startTimeMs) / 1000);
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisStatus = await checkRedis();
    return {
      status: "ok",
      timestamp,
      database: "connected",
      redis: redisStatus,
      uptime,
    };
  } catch {
    const redisStatus = await checkRedis();
    return {
      status: "error",
      timestamp,
      database: "disconnected",
      redis: redisStatus,
      uptime,
    };
  }
}

/**
 * Readiness: 200 only when DB (and in production Redis) are available.
 */
export async function runReadinessCheck(): Promise<ReadinessResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return { ready: false, reason: "database" };
  }

  if (env.NODE_ENV === "production" && env.REDIS_URL) {
    try {
      const client = await getRedisClient();
      if (!client) return { ready: false, reason: "redis" };
      await client.get("__ready_check__");
    } catch {
      return { ready: false, reason: "redis" };
    }
  }

  return { ready: true };
}
