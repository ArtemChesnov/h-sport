/**
 * Сервис для расчета эффективности промокодов (ROI)
 */

import { prisma } from "@/prisma/prisma-client";
import { OrderStatus } from "@prisma/client";
import {
  calculateAverageDiscountPerOrder,
  calculateAverageOrderValue,
  calculatePromoROI,
  calculatePromoUsageRate,
} from "@/shared/lib/business-metrics";

export interface PromoEffectiveness {
  total: number;
  usageRate: number;
  effectiveness: Array<{
    id: number;
    code: string;
    type: string;
    value: number;
    usageCount: number;
    totalDiscount: number;
    totalRevenue: number;
    averageOrderValue: number;
    roi: number;
    avgDiscountPerOrder: number;
  }>;
}

export async function getPromoEffectiveness(days: number): Promise<PromoEffectiveness> {
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

  const promoOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: now },
      status: { in: includedStatuses },
      promoCodeId: { not: null },
    },
    include: {
      promoCode: {
        select: { id: true, code: true, type: true, value: true },
      },
    },
  });

  const promoMetrics = new Map<
    number,
    {
      id: number;
      code: string;
      type: string;
      value: number;
      usageCount: number;
      totalDiscount: number;
      totalRevenue: number;
    }
  >();

  promoOrders.forEach((order) => {
    if (!order.promoCode) return;
    const existing = promoMetrics.get(order.promoCodeId!);
    const discount = order.discount || 0;
    const revenue = order.total || 0;

    if (existing) {
      existing.usageCount += 1;
      existing.totalDiscount += discount;
      existing.totalRevenue += revenue;
    } else {
      promoMetrics.set(order.promoCodeId!, {
        id: order.promoCode.id,
        code: order.promoCode.code,
        type: order.promoCode.type,
        value: order.promoCode.value,
        usageCount: 1,
        totalDiscount: discount,
        totalRevenue: revenue,
      });
    }
  });

  const totalOrdersWithPromo = promoOrders.length;
  const totalOrdersAll = await prisma.order.count({
    where: {
      createdAt: { gte: from, lte: now },
      status: { in: includedStatuses },
    },
  });

  const effectiveness = Array.from(promoMetrics.values())
    .map((promo) => {
      const metrics = {
        usageCount: promo.usageCount,
        totalDiscount: promo.totalDiscount,
        totalRevenue: promo.totalRevenue,
      };
      return {
        ...promo,
        roi: calculatePromoROI(metrics),
        avgDiscountPerOrder: calculateAverageDiscountPerOrder(metrics),
        averageOrderValue: calculateAverageOrderValue(metrics),
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    total: promoMetrics.size,
    usageRate: calculatePromoUsageRate(totalOrdersWithPromo, totalOrdersAll),
    effectiveness,
  };
}
