/** Дашборд админки: сводка, графики, топ товаров по периоду. */

import { prisma } from "@/prisma/prisma-client";
import type { DTO } from "@/shared/services";
import { OrderStatus } from "@prisma/client";

/** Статусы заказов, учитываемые в выручке */
const REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

/**
 * Парсит период с валидацией
 * @param raw - Строка периода из query параметра
 * @returns Валидный период (7d, 30d, 90d)
 */
export function parsePeriod(raw: string | null): DTO.AdminDashboardPeriodDto {
  const allowed: DTO.AdminDashboardPeriodDto[] = ["7d", "30d", "90d"];
  if (!raw) return "30d";
  if (allowed.includes(raw as DTO.AdminDashboardPeriodDto)) {
    return raw as DTO.AdminDashboardPeriodDto;
  }
  return "30d";
}

/**
 * Конвертирует период в количество дней
 */
export function periodToDays(period: DTO.AdminDashboardPeriodDto): number {
  switch (period) {
    case "7d":
      return 7;
    case "90d":
      return 90;
    case "30d":
    default:
      return 30;
  }
}

/**
 * Форматирует дату в YYYY-MM-DD
 */
function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Вычисляет диапазон дат для периода
 */
export function getDateRange(period: DTO.AdminDashboardPeriodDto): { from: Date; to: Date } {
  const days = periodToDays(period);
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from, to };
}

/**
 * Получает сводные показатели за период
 */
export async function getSummary(
  from: Date,
  to: Date,
  period: DTO.AdminDashboardPeriodDto,
): Promise<DTO.AdminDashboardSummaryDto> {
  const where = {
    createdAt: { gte: from, lte: to },
    status: { in: REVENUE_STATUSES },
  };

  const [summaryAgg, paidOrdersCount, totalOrdersCount] = await Promise.all([
    prisma.order.aggregate({
      where,
      _sum: { total: true, subtotal: true, discount: true, deliveryFee: true },
      _count: { _all: true },
      _avg: { total: true },
    }),
    prisma.order.count({
      where: { ...where, status: OrderStatus.PAID },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    totalOrders: totalOrdersCount,
    totalRevenue: summaryAgg._sum.total ?? 0,
    averageCheck: summaryAgg._avg.total ? Math.round(summaryAgg._avg.total) : 0,
    paidOrders: paidOrdersCount,
  };
}

/**
 * Получает данные для графика по дням
 */
export async function getChartData(
  from: Date,
  to: Date,
): Promise<DTO.AdminDashboardChartPointDto[]> {
  const where = {
    createdAt: { gte: from, lte: to },
    status: { in: REVENUE_STATUSES },
  };

  const chartData = await prisma.order.groupBy({
    by: ["createdAt"],
    where,
    _count: { _all: true },
    _sum: { total: true },
  });

  // Создаём сетку на весь период
  const chartMap = new Map<string, { ordersCount: number; revenue: number }>();
  const tmp = new Date(from);
  while (tmp <= to) {
    chartMap.set(toDateKey(tmp), { ordersCount: 0, revenue: 0 });
    tmp.setDate(tmp.getDate() + 1);
  }

  // Заполняем данными из агрегации
  for (const item of chartData) {
    const key = toDateKey(item.createdAt);
    const existing = chartMap.get(key);
    if (existing) {
      existing.ordersCount = item._count._all;
      existing.revenue = item._sum.total ?? 0;
    } else {
      chartMap.set(key, {
        ordersCount: item._count._all,
        revenue: item._sum.total ?? 0,
      });
    }
  }

  return Array.from(chartMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({
      date,
      ordersCount: value.ordersCount,
      revenue: value.revenue,
    }));
}

/**
 * Получает топ-3 товара по продажам
 */
export async function getTopProducts(
  from: Date,
  to: Date,
): Promise<DTO.AdminDashboardTopProductDto[]> {
  const orderItems = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: {
      order: {
        createdAt: { gte: from, lte: to },
        status: { in: REVENUE_STATUSES },
      },
    },
    _sum: { qty: true, total: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 3,
  });

  const top3 = orderItems.map((item) => ({
    productId: item.productId,
    name: item.productName,
    totalQty: item._sum.qty ?? 0,
    totalRevenue: item._sum.total ?? 0,
  }));

  // Подтягиваем slug
  const topIds = top3.map((p) => p.productId);
  let slugById = new Map<number, string>();

  if (topIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: topIds } },
      select: { id: true, slug: true },
    });
    slugById = new Map(products.map((p) => [p.id, p.slug]));
  }

  return top3.map((p) => ({
    productId: p.productId,
    name: p.name,
    slug: slugById.get(p.productId) ?? null,
    totalQty: p.totalQty,
    totalRevenue: p.totalRevenue,
  }));
}

/**
 * Получает полные данные дашборда
 */
export async function getDashboardData(
  period: DTO.AdminDashboardPeriodDto,
): Promise<DTO.AdminDashboardResponseDto> {
  const { from, to } = getDateRange(period);

  const [summary, chart, topProducts] = await Promise.all([
    getSummary(from, to, period),
    getChartData(from, to),
    getTopProducts(from, to),
  ]);

  return { summary, chart, topProducts };
}
