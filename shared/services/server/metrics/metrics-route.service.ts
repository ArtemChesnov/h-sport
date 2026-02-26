/**
 * Facade for metrics API routes: all DB access here (Prisma), routes stay thin.
 */

import { prisma } from "@/prisma/prisma-client";
import { getSlowQueryThreshold } from "@/shared/lib/metrics";
import { buildPaginatedResponse, calculateSkip } from "@/shared/lib/pagination";
import {
  exportMetrics,
  parseMetricType,
  parsePeriodDays,
  type ExportResult,
  type MetricType,
} from "@/shared/services/server/admin/metrics-export.service";
import { getAdvancedMetrics } from "@/shared/services/server/admin/advanced-metrics.service";
import type { AdvancedMetricsResponse } from "@/shared/services/server/admin/advanced-metrics.service";

export { parseMetricType, parsePeriodDays };
export type { ExportResult, MetricType };

/** Export metrics to CSV (uses prisma inside). */
export async function exportMetricsCSV(
  type: MetricType,
  days: number,
): Promise<ExportResult> {
  return exportMetrics(prisma, type, days);
}

/** Advanced metrics (uses prisma inside). */
export async function getAdvancedMetricsData(
  periodDays: number,
): Promise<AdvancedMetricsResponse> {
  return getAdvancedMetrics(prisma, periodDays);
}

export interface SlowQueryItem {
  id: number;
  query: string;
  duration: number;
  endpoint: string | null;
  userId: string | null;
  createdAt: Date;
}

export interface SlowQueriesPageParams {
  page: number;
  perPage: number;
  periodDays: number;
  minDuration?: number;
  endpoint?: string;
}

export type SlowQueriesPageResult = ReturnType<typeof buildPaginatedResponse<SlowQueryItem>>;

export async function getSlowQueriesPage(
  params: SlowQueriesPageParams,
): Promise<ReturnType<typeof buildPaginatedResponse<SlowQueryItem>>> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - params.periodDays);
  from.setHours(0, 0, 0, 0);

  const where: {
    createdAt: { gte: Date; lte: Date };
    duration?: { gte: number };
    endpoint?: { contains: string; mode: "insensitive" };
  } = {
    createdAt: { gte: from, lte: now },
  };
  if (params.minDuration !== undefined) where.duration = { gte: params.minDuration };
  if (params.endpoint) where.endpoint = { contains: params.endpoint, mode: "insensitive" };

  const [total, slowQueries] = await Promise.all([
    prisma.slowQuery.count({ where }),
    prisma.slowQuery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: calculateSkip(params.page, params.perPage),
      take: params.perPage,
    }),
  ]);

  const items: SlowQueryItem[] = slowQueries.map((q) => ({
    id: q.id,
    query: q.query,
    duration: q.duration,
    endpoint: q.endpoint,
    userId: q.userId,
    createdAt: q.createdAt,
  }));

  return buildPaginatedResponse<SlowQueryItem>(items, total, params.page, params.perPage);
}

/** Web Vitals aggregate (raw SQL). */
export async function getWebVitalsAggregate(periodHours: number) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - periodHours);

  const webVitals = await prisma.$queryRaw<Array<{
    name: string;
    count: number;
    avg: number;
    p50: number;
    p75: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  }>>`
    SELECT
      name,
      COUNT(*) as count,
      AVG(value) as avg,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99,
      MIN(value) as min,
      MAX(value) as max
    FROM "WebVitalsMetric"
    WHERE "createdAt" >= ${cutoff}
    GROUP BY name
    ORDER BY name
  `;

  return {
    period: { hours: periodHours, from: cutoff.toISOString(), to: new Date().toISOString() },
    metrics: webVitals,
  };
}

/** Incidents list. */
export async function listIncidents(params: {
  status?: "ACTIVE" | "RESOLVED";
  severity?: "INFO" | "WARNING" | "CRITICAL";
  limit: number;
  offset: number;
}) {
  const where: { status?: "ACTIVE" | "RESOLVED"; severity?: "INFO" | "WARNING" | "CRITICAL" } = {};
  if (params.status) where.status = params.status;
  if (params.severity) where.severity = params.severity;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit,
      skip: params.offset,
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    incidents,
    pagination: {
      total,
      limit: params.limit,
      offset: params.offset,
      hasMore: params.offset + params.limit < total,
    },
  };
}

export interface CreateIncidentInput {
  fingerprint: string;
  source: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
}

/** Create or reactivate incident. Returns { incident, created }. */
export async function createOrUpdateIncident(data: CreateIncidentInput): Promise<{
  incident: Awaited<ReturnType<typeof prisma.incident.create>>;
  created: boolean;
}> {
  const existing = await prisma.incident.findUnique({
    where: { fingerprint: data.fingerprint },
  });

  if (existing) {
    const incident = await prisma.incident.update({
      where: { fingerprint: data.fingerprint },
      data: {
        title: data.title,
        message: data.message,
        severity: data.severity,
        source: data.source,
        status: "ACTIVE",
        resolvedAt: null,
      },
    });
    return { incident, created: false };
  }
  const incident = await prisma.incident.create({
    data: {
      fingerprint: data.fingerprint,
      source: data.source,
      severity: data.severity,
      title: data.title,
      message: data.message,
    },
  });
  return { incident, created: true };
}

/** Update incident status. */
export async function updateIncidentStatus(
  id: number,
  status: "ACTIVE" | "RESOLVED",
) {
  return prisma.incident.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "RESOLVED" ? new Date() : null,
    },
  });
}

/** Get incident by id or null. */
export async function getIncidentById(id: number) {
  return prisma.incident.findUnique({ where: { id } });
}

/** DB metrics (slow queries stats + top + by endpoint). */
export async function getDbMetrics(periodHours: number) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - periodHours);

  const [slowQueriesStats, topSlowQueries, slowQueriesByEndpoint] = await Promise.all([
    prisma.$queryRaw<Array<{
      count: number;
      avg_duration: number;
      p95_duration: number;
      p99_duration: number;
      max_duration: number;
      total_duration: number;
    }>>`
      SELECT
        COUNT(*) as count,
        AVG(duration) as avg_duration,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95_duration,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration) as p99_duration,
        MAX(duration) as max_duration,
        SUM(duration) as total_duration
      FROM "SlowQuery"
      WHERE "createdAt" >= ${cutoff}
    `,
    prisma.slowQuery.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { query: true, duration: true, endpoint: true, createdAt: true },
      orderBy: { duration: "desc" },
      take: 10,
    }),
    prisma.$queryRaw<Array<{ endpoint: string; count: number; avg_duration: number }>>`
      SELECT
        COALESCE(endpoint, 'unknown') as endpoint,
        COUNT(*) as count,
        AVG(duration) as avg_duration
      FROM "SlowQuery"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  const stats = slowQueriesStats[0] || {
    count: 0,
    avg_duration: 0,
    p95_duration: 0,
    p99_duration: 0,
    max_duration: 0,
    total_duration: 0,
  };

  return {
    period: { hours: periodHours, from: cutoff.toISOString(), to: new Date().toISOString() },
    threshold: { slowQueryMs: getSlowQueryThreshold() },
    slowQueries: {
      total: stats.count,
      avgDuration: Math.round(stats.avg_duration || 0),
      p95Duration: Math.round(stats.p95_duration || 0),
      p99Duration: Math.round(stats.p99_duration || 0),
      maxDuration: Math.round(stats.max_duration || 0),
      totalDuration: Math.round(stats.total_duration || 0),
    },
    topSlowQueries: topSlowQueries.map((q) => ({
      query: q.query,
      duration: q.duration,
      endpoint: q.endpoint,
      createdAt: q.createdAt.toISOString(),
    })),
    byEndpoint: slowQueriesByEndpoint.map((e) => ({
      endpoint: e.endpoint,
      count: e.count,
      avgDuration: Math.round(e.avg_duration),
    })),
    connectionPool: {
      provider: "postgresql",
      note: "Подробная информация о пуле соединений недоступна через Prisma Client",
    },
  };
}

/** Server metrics history (BigInt serialized to number). */
export async function getServerMetricsHistory(periodHours: number) {
  const now = new Date();
  const from = new Date();
  from.setHours(now.getHours() - periodHours);

  const metrics = await prisma.serverMetrics.findMany({
    where: { createdAt: { gte: from, lte: now } },
    orderBy: { createdAt: "asc" },
  });

  const items = metrics.map((m) => ({
    id: m.id,
    heapUsed: Number(m.heapUsed),
    heapTotal: Number(m.heapTotal),
    rss: Number(m.rss),
    external: Number(m.external),
    cpuUser: Number(m.cpuUser),
    cpuSystem: Number(m.cpuSystem),
    cpuCount: m.cpuCount,
    freemem: Number(m.freemem),
    totalmem: Number(m.totalmem),
    uptime: m.uptime,
    createdAt: m.createdAt,
  }));

  return { items };
}

/**
 * Удаляет устаревшие записи WebVitalsMetric старше заданного числа дней.
 */
export async function cleanOldWebVitals(retentionDays: number): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const result = await prisma.webVitalsMetric.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return result.count;
}
