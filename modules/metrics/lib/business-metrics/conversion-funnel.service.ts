/**
 * Сервис для расчета воронки конверсий
 * Отслеживает путь пользователя: Просмотр → Корзина → Заказ
 */

import { prisma } from "@/prisma/prisma-client";
import { OrderStatus } from "@prisma/client";

export interface ConversionFunnelStep {
  name: string;
  count: number;
  rate: number; // Процент от предыдущего шага
  dropoff: number; // Процент потерь от предыдущего шага
}

export interface ConversionFunnel {
  steps: ConversionFunnelStep[];
  overallConversionRate: number; // Просмотр → Заказ
  period: {
    from: string;
    to: string;
    days: number;
  };
  /** Детальная статистика по шагам */
  details: {
    uniqueVisitors: number;
    viewedProducts: number;
    addedToCart: number;
    startedCheckout: number;
    completedOrder: number;
    paidOrders: number;
  };
}

interface CountResult {
  count: bigint;
}

export async function getConversionFunnel(days: number): Promise<ConversionFunnel> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const excludedStatuses = [OrderStatus.CANCELED];
  const paidStatuses = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  // Выполняем все запросы параллельно для оптимизации
  const [
    // 1. Уникальные посетители (по userId в ProductView)
    uniqueVisitorsResult,
    // 2. Просмотры товаров (уникальные пользователи, которые смотрели товары)
    viewedProductsResult,
    // 3. Добавили в корзину (уникальные пользователи)
    addedToCartResult,
    // 4. Начали оформление (корзины с заполненными данными или заказы pending)
    startedCheckoutResult,
    // 5. Оформили заказ (любой статус)
    completedOrderResult,
    // 6. Оплаченные заказы
    paidOrdersResult,
  ] = await Promise.all([
    // Уникальные посетители
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "ProductView"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND "userId" IS NOT NULL
    `,
    // Просмотры товаров (уникальные пользователи)
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "ProductView"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND "userId" IS NOT NULL
    `,
    // Добавили в корзину
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "CartAction"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND action = 'add'
      AND "userId" IS NOT NULL
    `,
    // Начали оформление (корзины, которые перешли в заказы)
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "Order"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND "userId" IS NOT NULL
    `,
    // Оформили заказ (уникальные пользователи), исключаем отменённые
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "Order"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND "userId" IS NOT NULL
      AND NOT (status = ANY(${excludedStatuses}))
    `,
    // Оплаченные заказы (уникальные пользователи)
    prisma.$queryRaw<[CountResult]>`
      SELECT COUNT(DISTINCT "userId")::bigint AS count
      FROM "Order"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
      AND "userId" IS NOT NULL
      AND status = ANY(${paidStatuses})
    `,
  ]);

  const uniqueVisitors = Number(uniqueVisitorsResult[0]?.count ?? 0);
  const viewedProducts = Number(viewedProductsResult[0]?.count ?? 0);
  const addedToCart = Number(addedToCartResult[0]?.count ?? 0);
  const startedCheckout = Number(startedCheckoutResult[0]?.count ?? 0);
  const completedOrder = Number(completedOrderResult[0]?.count ?? 0);
  const paidOrders = Number(paidOrdersResult[0]?.count ?? 0);

  // Рассчитываем воронку
  const calculateRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 10000) / 100;
  };

  const calculateDropoff = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return Math.round(((previous - current) / previous) * 10000) / 100;
  };

  const steps: ConversionFunnelStep[] = [
    {
      name: "Просмотр товаров",
      count: viewedProducts,
      rate: 100,
      dropoff: 0,
    },
    {
      name: "Добавление в корзину",
      count: addedToCart,
      rate: calculateRate(addedToCart, viewedProducts),
      dropoff: calculateDropoff(addedToCart, viewedProducts),
    },
    {
      name: "Оформление заказа",
      count: completedOrder,
      rate: calculateRate(completedOrder, addedToCart),
      dropoff: calculateDropoff(completedOrder, addedToCart),
    },
    {
      name: "Оплата",
      count: paidOrders,
      rate: calculateRate(paidOrders, completedOrder),
      dropoff: calculateDropoff(paidOrders, completedOrder),
    },
  ];

  const overallConversionRate = calculateRate(paidOrders, viewedProducts);

  return {
    steps,
    overallConversionRate,
    period: {
      from: from.toISOString(),
      to: now.toISOString(),
      days,
    },
    details: {
      uniqueVisitors,
      viewedProducts,
      addedToCart,
      startedCheckout,
      completedOrder,
      paidOrders,
    },
  };
}
