/**
 * Сервис для расчета LTV (Lifetime Value) и повторных покупок
 */

import { prisma } from "@/prisma/prisma-client";
import { getExcludeTestUserOrderWhere } from "@/shared/lib/auth/privileged";
import { OrderStatus } from "@prisma/client";
import {
  calculateAverageLTV,
  calculateAverageOrdersPerCustomer,
  calculateRepeatCustomerRate,
} from "@/shared/lib/business-metrics";

export interface LTVMetrics {
  totalCustomers: number;
  repeatCustomersCount: number;
  repeatCustomersRate: number;
  averageLTV: number;
  topCustomers: Array<{ userId: string; orderCount: number; totalSpent: number }>;
  averageOrdersPerCustomer: number;
}

export async function getLTVMetrics(days: number): Promise<LTVMetrics> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const includedStatuses: OrderStatus[] = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  const ordersInPeriod = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: now },
      status: { in: includedStatuses },
      userId: { not: null },
      ...getExcludeTestUserOrderWhere(),
    },
    include: {
      user: {
        select: { id: true, createdAt: true },
      },
    },
  });

  // Группируем заказы по пользователям
  const userOrders = new Map<string, typeof ordersInPeriod>();
  ordersInPeriod.forEach((order) => {
    if (order.userId) {
      const existing = userOrders.get(order.userId) || [];
      existing.push(order);
      userOrders.set(order.userId, existing);
    }
  });

  const repeatCustomers = Array.from(userOrders.entries())
    .filter(([, orders]) => orders.length > 1)
    .map(([userId, orders]) => ({
      userId,
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      firstOrderDate: orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
        .createdAt,
      lastOrderDate: orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        .createdAt,
    }));

  const allCustomerSpent = Array.from(userOrders.values()).map((orders) =>
    orders.reduce((sum, o) => sum + o.total, 0)
  );

  return {
    totalCustomers: userOrders.size,
    repeatCustomersCount: repeatCustomers.length,
    repeatCustomersRate: calculateRepeatCustomerRate(repeatCustomers.length, userOrders.size),
    averageLTV: calculateAverageLTV(
      allCustomerSpent.map((spent) => ({
        orderCount: 0,
        totalSpent: spent,
        firstOrderDate: new Date(),
        lastOrderDate: new Date(),
      }))
    ),
    topCustomers: repeatCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map((c) => ({
        userId: c.userId,
        orderCount: c.orderCount,
        totalSpent: c.totalSpent,
      })),
    averageOrdersPerCustomer: calculateAverageOrdersPerCustomer(
      ordersInPeriod.length,
      userOrders.size
    ),
  };
}
