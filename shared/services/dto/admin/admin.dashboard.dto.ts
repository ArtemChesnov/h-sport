
/**
 * Предустановленные периоды для дашборда.
 *
 * - "7d"  — последние 7 дней
 * - "30d" — последние 30 дней (по умолчанию)
 * - "90d" — последние 90 дней
 */
export type AdminDashboardPeriodDto = "7d" | "30d" | "90d";

/**
 * Сводные показатели по заказам за период.
 *
 * Все суммы — в копейках.
 */
export type AdminDashboardSummaryDto = {
  period: AdminDashboardPeriodDto;

  /** ISO-строка начала периода (включительно) */
  from: string;

  /** ISO-строка конца периода (включительно) */
  to: string;

  /** Всего заказов за период (учитываем только “живые” статусы, см. бэкенд) */
  totalOrders: number;

  /** Общая выручка за период (копейки) */
  totalRevenue: number;

  /** Средний чек (копейки) */
  averageCheck: number;

  /** Кол-во оплаченных/завершённых заказов, если когда-нибудь пригодится для метрик */
  paidOrders: number;
};

/**
 * Точка для графика “день → метрики”.
 */
export type AdminDashboardChartPointDto = {
  /** Дата в формате YYYY-MM-DD */
  date: string;

  /** Кол-во заказов за день */
  ordersCount: number;

  /** Выручка за день (копейки) */
  revenue: number;
};

/**
 * Топовый товар по продажам за период.
 */
export type AdminDashboardTopProductDto = {
  productId: number;
  name: string;

  /** slug товара (может быть null, если не найдём по id) */
  slug: string | null;

  /** Сколько штук продали за период */
  totalQty: number;

  /** Сколько денег принёс товар за период (копейки) */
  totalRevenue: number;
};

/**
 * Ответ на GET /api/(admin)/dashboard.
 */
export type AdminDashboardResponseDto = {
  summary: AdminDashboardSummaryDto;
  chart: AdminDashboardChartPointDto[];
  topProducts: AdminDashboardTopProductDto[];
};
