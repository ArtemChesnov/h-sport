/** Экспорт метрик в CSV (api, slow-queries, ecommerce, orders). */

import { MAX_METRICS_PERIOD_DAYS } from "@/shared/constants";
import type { PrismaClient } from "@prisma/client";

export type MetricType = "api" | "slow-queries" | "ecommerce" | "orders";

/** Результат экспорта */
export interface ExportResult {
  csv: string;
  filename: string;
}

/**
 * Парсит тип метрик
 */
export function parseMetricType(raw: string | null): MetricType {
  const allowed: MetricType[] = ["api", "slow-queries", "ecommerce", "orders"];
  if (raw && allowed.includes(raw as MetricType)) {
    return raw as MetricType;
  }
  return "api";
}

/**
 * Парсит период в дни
 */
export function parsePeriodDays(raw: string | null): number {
  const days = parseInt(raw ?? "30", 10);
  if (!Number.isFinite(days) || days < 1) return 30;
  return Math.min(days, MAX_METRICS_PERIOD_DAYS);
}

/**
 * Конвертирует массив объектов в CSV
 */
export function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Экспортирует метрики в CSV
 */
export async function exportMetrics(
  prisma: PrismaClient,
  type: MetricType,
  days: number,
): Promise<ExportResult> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - days);
  from.setHours(0, 0, 0, 0);

  switch (type) {
    case "api":
      return exportApiMetrics(prisma, from, now, days);
    case "slow-queries":
      return exportSlowQueries(prisma, from, now, days);
    case "ecommerce":
      return exportEcommerceMetrics(prisma, from, now, days);
    case "orders":
      return exportOrders(prisma, from, now, days);
  }
}

async function exportApiMetrics(
  prisma: PrismaClient,
  from: Date,
  to: Date,
  days: number,
): Promise<ExportResult> {
  const metrics = await prisma.apiMetric.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  return {
    csv: toCSV(
      metrics.map((m) => ({
        id: m.id,
        endpoint: m.endpoint,
        method: m.method,
        statusCode: m.statusCode,
        duration: m.duration,
        createdAt: m.createdAt.toISOString(),
      })),
    ),
    filename: `api-metrics-${days}d.csv`,
  };
}

async function exportSlowQueries(
  prisma: PrismaClient,
  from: Date,
  to: Date,
  days: number,
): Promise<ExportResult> {
  const queries = await prisma.slowQuery.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  return {
    csv: toCSV(
      queries.map((q) => ({
        id: q.id,
        query: q.query,
        duration: q.duration,
        endpoint: q.endpoint ?? "",
        userId: q.userId ?? "",
        createdAt: q.createdAt.toISOString(),
      })),
    ),
    filename: `slow-queries-${days}d.csv`,
  };
}

async function exportEcommerceMetrics(
  prisma: PrismaClient,
  from: Date,
  to: Date,
  days: number,
): Promise<ExportResult> {
  const [views, cartActions, favorites] = await Promise.all([
    prisma.productView.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 10000,
    }),
    prisma.cartAction.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 10000,
    }),
    prisma.favoriteAction.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 10000,
    }),
  ]);

  const allMetrics = [
    ...views.map((v) => ({
      type: "view",
      productId: v.productId,
      userId: v.userId ?? "",
      action: "",
      quantity: "",
      createdAt: v.createdAt.toISOString(),
    })),
    ...cartActions.map((c) => ({
      type: "cart",
      productId: c.productId,
      userId: c.userId ?? "",
      action: c.action,
      quantity: c.quantity,
      createdAt: c.createdAt.toISOString(),
    })),
    ...favorites.map((f) => ({
      type: "favorite",
      productId: f.productId,
      userId: f.userId,
      action: f.action,
      quantity: "",
      createdAt: f.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    csv: toCSV(allMetrics),
    filename: `ecommerce-metrics-${days}d.csv`,
  };
}

async function exportOrders(
  prisma: PrismaClient,
  from: Date,
  to: Date,
  days: number,
): Promise<ExportResult> {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      uid: true,
      status: true,
      email: true,
      phone: true,
      fullName: true,
      totalItems: true,
      subtotal: true,
      discount: true,
      deliveryFee: true,
      total: true,
      promoCodeCode: true,
      createdAt: true,
    },
    take: 10000,
  });

  return {
    csv: toCSV(
      orders.map((o) => ({
        id: o.id,
        uid: o.uid,
        status: o.status,
        email: o.email,
        phone: o.phone ?? "",
        fullName: o.fullName ?? "",
        totalItems: o.totalItems,
        subtotal: o.subtotal,
        discount: o.discount,
        deliveryFee: o.deliveryFee,
        total: o.total,
        promoCode: o.promoCodeCode ?? "",
        createdAt: o.createdAt.toISOString(),
      })),
    ),
    filename: `orders-${days}d.csv`,
  };
}
