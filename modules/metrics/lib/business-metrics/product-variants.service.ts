/**
 * Сервис для статистики по размерам/цветам товаров
 */

import { prisma } from "@/prisma/prisma-client";
import { OrderStatus } from "@prisma/client";

export interface ProductVariantsStats {
  sizes: Array<{ size: string; count: number; revenue: number }>;
  colors: Array<{ color: string; count: number; revenue: number }>;
  topCombinations: Array<{ size: string; color: string; count: number; revenue: number }>;
}

export async function getProductVariantsStats(days: number): Promise<ProductVariantsStats> {
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

  const orderItemsInPeriod = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: from, lte: now },
        status: { in: includedStatuses },
      },
    },
    select: {
      qty: true,
      size: true,
      color: true,
      total: true,
    },
  });

  // Статистика по размерам
  const sizeStats = new Map<string, { size: string; count: number; revenue: number }>();
  orderItemsInPeriod.forEach((item) => {
    const size = (item.size && item.size.trim()) || "ONE_SIZE";
    const existing = sizeStats.get(size);
    if (existing) {
      existing.count += item.qty || 0;
      existing.revenue += item.total || 0;
    } else {
      sizeStats.set(size, {
        size,
        count: item.qty || 0,
        revenue: item.total || 0,
      });
    }
  });

  // Статистика по цветам
  const colorStats = new Map<string, { color: string; count: number; revenue: number }>();
  orderItemsInPeriod.forEach((item) => {
    const color = (item.color && item.color.trim()) || "Не указан";
    const existing = colorStats.get(color);
    if (existing) {
      existing.count += item.qty || 0;
      existing.revenue += item.total || 0;
    } else {
      colorStats.set(color, {
        color,
        count: item.qty || 0,
        revenue: item.total || 0,
      });
    }
  });

  // Комбинации размер-цвет
  const sizeColorCombos = new Map<string, { size: string; color: string; count: number; revenue: number }>();
  orderItemsInPeriod.forEach((item) => {
    const size = (item.size && item.size.trim()) || "ONE_SIZE";
    const color = (item.color && item.color.trim()) || "Не указан";
    const key = `${size}-${color}`;
    const existing = sizeColorCombos.get(key);
    if (existing) {
      existing.count += item.qty || 0;
      existing.revenue += item.total || 0;
    } else {
      sizeColorCombos.set(key, {
        size,
        color,
        count: item.qty || 0,
        revenue: item.total || 0,
      });
    }
  });

  return {
    sizes: Array.from(sizeStats.values()).sort((a, b) => b.count - a.count),
    colors: Array.from(colorStats.values()).sort((a, b) => b.count - a.count),
    topCombinations: Array.from(sizeColorCombos.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
