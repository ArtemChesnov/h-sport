/** Расширенные метрики: корзины, заказы, пользователи, доставка, платежи (лимиты). */

import {
    ADVANCED_METRICS_CART_SAMPLE_LIMIT,
    ADVANCED_METRICS_ORDER_ITEMS_LIMIT,
    ADVANCED_METRICS_USERS_ORDERS_LIMIT,
    MAX_METRICS_QUERY_LIMIT,
    PRODUCT_IDS_BATCH_SIZE,
} from "@/shared/constants";
import type { PrismaClient } from "@prisma/client";
import { OrderStatus, PaymentStatus } from "@prisma/client";

/** Период для метрик */
export interface MetricsPeriod {
  days: number;
  from: Date;
  to: Date;
}

/** Метрики корзины */
export interface CartMetrics {
  averageCartSize: number;
  abandonedCartRate: number;
  totalCarts: number;
  abandonedCarts: number;
  averageItemPrice: number;
}

/** Метрики заказов */
export interface OrderMetrics {
  totalOrders: number;
  averageOrderValue: number;
}

/** Метрики пользователей */
export interface UserMetrics {
  newUsers: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatCustomers: number;
  averageOrdersPerUser: number;
  averageRevenuePerUser: number;
  newVsReturningRate: number;
  newCustomersRate: number;
}

/** Метрики доставки */
export interface DeliveryMetrics {
  distribution: Record<string, number>;
  averageDeliveryFee: number;
  totalDeliveries: number;
}

/** Метрики оплаты */
export interface PaymentMetrics {
  distribution: Record<string, number>;
  totalPayments: number;
}

/** Метрики категорий */
export interface CategoryMetrics {
  popularCategories: Array<{
    name: string;
    views: number;
    orders: number;
    revenue: number;
    items: number;
    averageOrderValue: number;
  }>;
}

/** Полный ответ метрик */
export interface AdvancedMetricsResponse {
  period: { days: number; from: string; to: string };
  cart: CartMetrics;
  orders: OrderMetrics;
  users: UserMetrics;
  delivery: DeliveryMetrics;
  payment: PaymentMetrics;
  categories: CategoryMetrics;
}

const PAID_ORDER_STATUSES = [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

/**
 * Получает все расширенные метрики
 */
export async function getAdvancedMetrics(
  prisma: PrismaClient,
  periodDays: number,
): Promise<AdvancedMetricsResponse> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);

  const [cart, orders, users, delivery, payment, categories] = await Promise.all([
    getCartMetrics(prisma, cutoff),
    getOrderMetrics(prisma, cutoff),
    getUserMetrics(prisma, cutoff),
    getDeliveryMetrics(prisma, cutoff),
    getPaymentMetrics(prisma, cutoff),
    getCategoryMetrics(prisma, cutoff),
  ]);

  return {
    period: {
      days: periodDays,
      from: cutoff.toISOString(),
      to: new Date().toISOString(),
    },
    cart,
    orders,
    users,
    delivery,
    payment,
    categories,
  };
}

/**
 * Метрики корзины
 */
async function getCartMetrics(prisma: PrismaClient, cutoff: Date): Promise<CartMetrics> {
  const cartAgg = await prisma.cart.aggregate({
    where: { createdAt: { gte: cutoff }, items: { some: {} } },
    _avg: { totalItems: true },
    _count: { _all: true },
  });

  const cartsWithToken = await prisma.cart.findMany({
    where: { createdAt: { gte: cutoff }, cartToken: { not: null }, items: { some: {} } },
    select: { cartToken: true },
    take: ADVANCED_METRICS_CART_SAMPLE_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  const cartTokens = cartsWithToken.map((c) => c.cartToken).filter(Boolean) as string[];
  const ordersFromCarts = await prisma.order.findMany({
    where: { cartToken: { in: cartTokens }, createdAt: { gte: cutoff } },
    select: { cartToken: true },
    take: ADVANCED_METRICS_CART_SAMPLE_LIMIT,
  });

  const orderedCartTokens = new Set(ordersFromCarts.map((o) => o.cartToken).filter(Boolean));
  const abandonedCarts = cartsWithToken.filter((c) => c.cartToken && !orderedCartTokens.has(c.cartToken as string));
  const abandonedCartRate = cartTokens.length > 0 ? (abandonedCarts.length / cartTokens.length) * 100 : 0;

  const cartItemsAgg = await prisma.cartItem.aggregate({
    where: { cart: { createdAt: { gte: cutoff }, items: { some: {} } } },
    _avg: { price: true },
  });

  return {
    averageCartSize: Math.round((cartAgg._avg.totalItems ?? 0) * 100) / 100,
    abandonedCartRate: Math.round(abandonedCartRate * 100) / 100,
    totalCarts: cartAgg._count._all,
    abandonedCarts: abandonedCarts.length,
    averageItemPrice: Math.round(cartItemsAgg._avg.price ?? 0),
  };
}

/**
 * Метрики заказов
 */
async function getOrderMetrics(prisma: PrismaClient, cutoff: Date): Promise<OrderMetrics> {
  const where = { createdAt: { gte: cutoff }, status: { in: PAID_ORDER_STATUSES } };

  const [orderAgg, totalOrders] = await Promise.all([
    prisma.order.aggregate({ where, _avg: { total: true } }),
    prisma.order.count({ where }),
  ]);

  return {
    totalOrders,
    averageOrderValue: Math.round(orderAgg._avg.total ?? 0),
  };
}

/**
 * Метрики пользователей
 */
async function getUserMetrics(prisma: PrismaClient, cutoff: Date): Promise<UserMetrics> {
  const orderWhere = { createdAt: { gte: cutoff }, status: { in: PAID_ORDER_STATUSES } };

  const [newUsers, allUsersWithOrders, ordersWithTotals] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: cutoff } } }),
    prisma.user.findMany({
      where: { orders: { some: orderWhere } },
      select: {
        id: true,
        createdAt: true,
        orders: {
          where: orderWhere,
          select: { id: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
      take: ADVANCED_METRICS_USERS_ORDERS_LIMIT,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: orderWhere,
      select: { userId: true, total: true },
      take: ADVANCED_METRICS_USERS_ORDERS_LIMIT,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalCustomers = allUsersWithOrders.length;
  const newCustomers = allUsersWithOrders.filter((u) => {
    const firstOrder = u.orders[0];
    return firstOrder && firstOrder.createdAt.getTime() - u.createdAt.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  const returningCustomers = totalCustomers - newCustomers;
  const repeatCustomers = allUsersWithOrders.filter((u) => u.orders.length > 1).length;
  const totalOrdersCount = allUsersWithOrders.reduce((sum, u) => sum + u.orders.length, 0);
  const averageOrdersPerUser = totalCustomers > 0 ? totalOrdersCount / totalCustomers : 0;
  const newCustomersRate = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;
  const totalRevenue = ordersWithTotals.reduce((sum, o) => sum + o.total, 0);
  const averageRevenuePerUser = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return {
    newUsers,
    totalCustomers,
    newCustomers,
    returningCustomers,
    repeatCustomers,
    averageOrdersPerUser: Math.round(averageOrdersPerUser * 100) / 100,
    averageRevenuePerUser: Math.round(averageRevenuePerUser),
    newVsReturningRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
    newCustomersRate: Math.round(newCustomersRate * 100) / 100,
  };
}

/**
 * Метрики доставки
 */
async function getDeliveryMetrics(prisma: PrismaClient, cutoff: Date): Promise<DeliveryMetrics> {
  const deliveryWhere = {
    order: { createdAt: { gte: cutoff }, status: { in: PAID_ORDER_STATUSES } },
  };

  const [deliveryMethodCounts, deliveryFeeAgg] = await Promise.all([
    prisma.delivery.groupBy({
      by: ["method"],
      where: deliveryWhere,
      _count: { _all: true },
    }),
    prisma.delivery.aggregate({
      where: deliveryWhere,
      _avg: { price: true },
      _count: { _all: true },
    }),
  ]);

  const distribution: Record<string, number> = {};
  deliveryMethodCounts.forEach((d) => {
    distribution[d.method] = d._count._all;
  });

  return {
    distribution,
    averageDeliveryFee: Math.round(deliveryFeeAgg._avg.price ?? 0),
    totalDeliveries: deliveryFeeAgg._count._all,
  };
}

/**
 * Метрики оплаты
 */
async function getPaymentMetrics(prisma: PrismaClient, cutoff: Date): Promise<PaymentMetrics> {
  const paymentWhere = { createdAt: { gte: cutoff }, status: PaymentStatus.PAID };

  const [paymentMethodCounts, totalPayments] = await Promise.all([
    prisma.payment.groupBy({
      by: ["method"],
      where: paymentWhere,
      _count: { _all: true },
    }),
    prisma.payment.count({ where: paymentWhere }),
  ]);

  const distribution: Record<string, number> = {};
  paymentMethodCounts.forEach((p) => {
    distribution[p.method] = p._count._all;
  });

  return { distribution, totalPayments };
}

/**
 * Метрики категорий
 */
async function getCategoryMetrics(prisma: PrismaClient, cutoff: Date): Promise<CategoryMetrics> {
  const orderWhere = { createdAt: { gte: cutoff }, status: { in: PAID_ORDER_STATUSES } };

  const orderItems = await prisma.orderItem.findMany({
    where: { order: orderWhere },
    select: { productId: true, total: true, qty: true },
    take: ADVANCED_METRICS_ORDER_ITEMS_LIMIT,
    orderBy: { id: "desc" },
  });

  const productIds = [...new Set(orderItems.map((i) => i.productId))];

  const batchPromises: Array<Promise<Array<{ id: number; category: { name: string } | null }>>> = [];
  for (let i = 0; i < productIds.length; i += PRODUCT_IDS_BATCH_SIZE) {
    const batch = productIds.slice(i, i + PRODUCT_IDS_BATCH_SIZE);
    batchPromises.push(
      prisma.product.findMany({
        where: { id: { in: batch } },
        select: { id: true, category: { select: { name: true } } },
      }),
    );
  }
  const products = (await Promise.all(batchPromises)).flat();

  const productCategoryMap = new Map(products.map((p) => [p.id, p.category?.name || "Без категории"]));
  const categoryStats: Record<string, { views: number; orders: number; revenue: number; items: number }> = {};

  orderItems.forEach((item) => {
    const categoryName = productCategoryMap.get(item.productId) || "Без категории";
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = { views: 0, orders: 0, revenue: 0, items: 0 };
    }
    categoryStats[categoryName].orders += 1;
    categoryStats[categoryName].revenue += item.total;
    categoryStats[categoryName].items += item.qty;
  });

  // Добавляем просмотры
  try {
    const productViews = await prisma.productView.findMany({
      where: { createdAt: { gte: cutoff }, productId: { in: productIds } },
      select: { productId: true },
      take: MAX_METRICS_QUERY_LIMIT,
    });

    productViews.forEach((view) => {
      const categoryName = productCategoryMap.get(view.productId) || "Без категории";
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = { views: 0, orders: 0, revenue: 0, items: 0 };
      }
      categoryStats[categoryName].views += 1;
    });
  } catch {
    // Модель может быть недоступна
  }

  const popularCategories = Object.entries(categoryStats)
    .map(([name, stats]) => ({
      name,
      views: stats.views,
      orders: stats.orders,
      revenue: stats.revenue,
      items: stats.items,
      averageOrderValue: stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return { popularCategories };
}
