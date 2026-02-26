/**
 * Сервис для расчета retention rate
 * Процент пользователей, вернувшихся и сделавших повторные покупки
 */

import { prisma } from "@/prisma/prisma-client";
import { OrderStatus } from "@prisma/client";

export interface RetentionMetrics {
  /** Процент клиентов, вернувшихся в течение 7 дней */
  retention7d: number;
  /** Процент клиентов, вернувшихся в течение 30 дней */
  retention30d: number;
  /** Процент клиентов, вернувшихся в течение 90 дней */
  retention90d: number;
  /** Общее количество уникальных клиентов за период */
  totalCustomers: number;
  /** Количество повторных клиентов */
  repeatCustomers: number;
  /** Процент повторных клиентов от общего числа */
  repeatRate: number;
  /** Среднее время между заказами (в днях) */
  avgDaysBetweenOrders: number;
  /** Когортный анализ: по неделям первой покупки */
  cohorts: RetentionCohort[];
  period: {
    from: string;
    to: string;
    days: number;
  };
}

export interface RetentionCohort {
  /** Неделя первой покупки (ISO date начала недели) */
  cohortWeek: string;
  /** Количество новых клиентов в когорте */
  newCustomers: number;
  /** Вернулись в течение 7 дней */
  returned7d: number;
  /** Вернулись в течение 30 дней */
  returned30d: number;
  /** Rate возврата за 7 дней */
  rate7d: number;
  /** Rate возврата за 30 дней */
  rate30d: number;
}

interface RetentionRow {
  user_id: string;
  first_order: Date;
  second_order: Date | null;
  days_between: number | null;
}

interface CohortRow {
  cohort_week: Date;
  user_id: string;
  first_order: Date;
  next_order: Date | null;
}

export async function getRetentionMetrics(days: number): Promise<RetentionMetrics> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const includedStatuses = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  // Получаем данные о первом и втором заказе каждого клиента
  const retentionData = await prisma.$queryRaw<RetentionRow[]>`
    WITH user_orders AS (
      SELECT
        "userId" AS user_id,
        "createdAt" AS order_date,
        ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") AS order_num
      FROM "Order"
      WHERE "userId" IS NOT NULL
        AND status = ANY(${includedStatuses})
    ),
    first_orders AS (
      SELECT user_id, order_date AS first_order
      FROM user_orders
      WHERE order_num = 1 AND order_date >= ${from} AND order_date <= ${now}
    ),
    second_orders AS (
      SELECT user_id, order_date AS second_order
      FROM user_orders
      WHERE order_num = 2
    )
    SELECT
      f.user_id,
      f.first_order,
      s.second_order,
      EXTRACT(DAY FROM (s.second_order - f.first_order))::int AS days_between
    FROM first_orders f
    LEFT JOIN second_orders s ON f.user_id = s.user_id
  `;

  const totalCustomers = retentionData.length;

  if (totalCustomers === 0) {
    return {
      retention7d: 0,
      retention30d: 0,
      retention90d: 0,
      totalCustomers: 0,
      repeatCustomers: 0,
      repeatRate: 0,
      avgDaysBetweenOrders: 0,
      cohorts: [],
      period: { from: from.toISOString(), to: now.toISOString(), days },
    };
  }

  // Рассчитываем retention по периодам
  const returned7d = retentionData.filter(
    (r) => r.days_between !== null && r.days_between <= 7,
  ).length;
  const returned30d = retentionData.filter(
    (r) => r.days_between !== null && r.days_between <= 30,
  ).length;
  const returned90d = retentionData.filter(
    (r) => r.days_between !== null && r.days_between <= 90,
  ).length;
  const repeatCustomers = retentionData.filter((r) => r.second_order !== null).length;

  // Среднее время между заказами (только для тех, кто сделал 2+ заказа)
  const returningCustomers = retentionData.filter((r) => r.days_between !== null);
  const avgDaysBetweenOrders =
    returningCustomers.length > 0
      ? Math.round(
          returningCustomers.reduce((sum, r) => sum + (r.days_between ?? 0), 0) /
            returningCustomers.length,
        )
      : 0;

  // Когортный анализ по неделям
  const cohortData = await prisma.$queryRaw<CohortRow[]>`
    WITH user_first_orders AS (
      SELECT
        "userId" AS user_id,
        MIN("createdAt") AS first_order
      FROM "Order"
      WHERE "userId" IS NOT NULL
        AND status = ANY(${includedStatuses})
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${now}
      GROUP BY "userId"
    ),
    user_next_orders AS (
      SELECT DISTINCT ON (ufo.user_id)
        ufo.user_id,
        ufo.first_order,
        DATE_TRUNC('week', ufo.first_order) AS cohort_week,
        o."createdAt" AS next_order
      FROM user_first_orders ufo
      LEFT JOIN "Order" o ON o."userId" = ufo.user_id
        AND o."createdAt" > ufo.first_order
        AND o.status = ANY(${includedStatuses})
      ORDER BY ufo.user_id, o."createdAt"
    )
    SELECT cohort_week, user_id, first_order, next_order
    FROM user_next_orders
    ORDER BY cohort_week
  `;

  // Группируем по когортам
  const cohortsMap = new Map<
    string,
    { newCustomers: number; returned7d: number; returned30d: number }
  >();

  for (const row of cohortData) {
    const weekKey = row.cohort_week.toISOString().split("T")[0];
    const cohort = cohortsMap.get(weekKey) ?? { newCustomers: 0, returned7d: 0, returned30d: 0 };
    cohort.newCustomers++;

    if (row.next_order) {
      const daysBetween = Math.floor(
        (row.next_order.getTime() - row.first_order.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysBetween <= 7) cohort.returned7d++;
      if (daysBetween <= 30) cohort.returned30d++;
    }

    cohortsMap.set(weekKey, cohort);
  }

  const cohorts: RetentionCohort[] = Array.from(cohortsMap.entries())
    .map(([cohortWeek, data]) => ({
      cohortWeek,
      newCustomers: data.newCustomers,
      returned7d: data.returned7d,
      returned30d: data.returned30d,
      rate7d: data.newCustomers > 0 ? Math.round((data.returned7d / data.newCustomers) * 10000) / 100 : 0,
      rate30d: data.newCustomers > 0 ? Math.round((data.returned30d / data.newCustomers) * 10000) / 100 : 0,
    }))
    .sort((a, b) => a.cohortWeek.localeCompare(b.cohortWeek));

  return {
    retention7d: Math.round((returned7d / totalCustomers) * 10000) / 100,
    retention30d: Math.round((returned30d / totalCustomers) * 10000) / 100,
    retention90d: Math.round((returned90d / totalCustomers) * 10000) / 100,
    totalCustomers,
    repeatCustomers,
    repeatRate: Math.round((repeatCustomers / totalCustomers) * 10000) / 100,
    avgDaysBetweenOrders,
    cohorts,
    period: { from: from.toISOString(), to: now.toISOString(), days },
  };
}
