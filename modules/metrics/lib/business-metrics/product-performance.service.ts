/**
 * Сервис для расчета производительности товаров
 * Детальная статистика по каждому товару: просмотры, добавления в корзину, заказы, выручка
 * Запросы к product.findMany батчами, чтобы не передавать в IN тысячи id.
 */

import { prisma } from "@/prisma/prisma-client";
import { PRODUCT_IDS_BATCH_SIZE } from "@/shared/constants";
import { OrderStatus } from "@prisma/client";

export interface ProductPerformanceItem {
  productId: number;
  name: string;
  slug: string;
  views: number;
  cartAdds: number;
  orders: number;
  revenue: number;
  viewToCartRate: number;
  cartToOrderRate: number;
}

export interface ProductPerformance {
  products: ProductPerformanceItem[];
  period: {
    from: string;
    to: string;
    days: number;
  };
  totals: {
    totalViews: number;
    totalCartAdds: number;
    totalOrders: number;
    totalRevenue: number;
    avgViewToCartRate: number;
    avgCartToOrderRate: number;
  };
}

interface ViewCountRow {
  product_id: number;
  count: bigint;
}

interface CartCountRow {
  product_id: number;
  count: bigint;
}

interface OrderStatsRow {
  product_id: number;
  orders: bigint;
  revenue: bigint | null;
}

interface ProductRow {
  id: number;
  name: string;
  slug: string;
}

export async function getProductPerformance(
  days: number,
  limit: number = 50,
): Promise<ProductPerformance> {
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

  // Получаем топ товаров по просмотрам
  const viewCounts = await prisma.$queryRaw<ViewCountRow[]>`
    SELECT "productId" AS product_id, COUNT(*)::bigint AS count
    FROM "ProductView"
    WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
    GROUP BY "productId"
    ORDER BY count DESC
    LIMIT ${limit}
  `;

  if (viewCounts.length === 0) {
    return {
      products: [],
      period: { from: from.toISOString(), to: now.toISOString(), days },
      totals: {
        totalViews: 0,
        totalCartAdds: 0,
        totalOrders: 0,
        totalRevenue: 0,
        avgViewToCartRate: 0,
        avgCartToOrderRate: 0,
      },
    };
  }

  const productIds = viewCounts.map((v) => v.product_id);

  const productBatchPromises: Array<Promise<ProductRow[]>> = [];
  for (let i = 0; i < productIds.length; i += PRODUCT_IDS_BATCH_SIZE) {
    const batch = productIds.slice(i, i + PRODUCT_IDS_BATCH_SIZE);
    productBatchPromises.push(
      prisma.product.findMany({
        where: { id: { in: batch } },
        select: { id: true, name: true, slug: true },
      }) as Promise<ProductRow[]>,
    );
  }
  const products = (await Promise.all(productBatchPromises)).flat();

  const [cartCounts, orderStats] = await Promise.all([
    prisma.$queryRaw<CartCountRow[]>`
      SELECT "productId" AS product_id, COUNT(*)::bigint AS count
      FROM "CartAction"
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${now}
        AND action = 'add'
        AND "productId" = ANY(${productIds})
      GROUP BY "productId"
    `,
    prisma.$queryRaw<OrderStatsRow[]>`
      SELECT oi."productId" AS product_id,
             COUNT(DISTINCT o.id)::bigint AS orders,
             SUM(oi.total)::bigint AS revenue
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."createdAt" >= ${from} AND o."createdAt" <= ${now}
        AND o.status = ANY(${includedStatuses})
        AND oi."productId" = ANY(${productIds})
      GROUP BY oi."productId"
    `,
  ]);

  // Создаем maps для быстрого доступа
  const viewsMap = new Map(viewCounts.map((v) => [v.product_id, Number(v.count)]));
  const cartsMap = new Map(cartCounts.map((c) => [c.product_id, Number(c.count)]));
  const ordersMap = new Map(
    orderStats.map((o) => [o.product_id, { orders: Number(o.orders), revenue: Number(o.revenue ?? 0) }]),
  );
  const productsMap = new Map(products.map((p) => [p.id, { name: p.name, slug: p.slug }]));

  // Собираем результат
  const performanceItems: ProductPerformanceItem[] = productIds
    .map((productId) => {
      const productInfo = productsMap.get(productId);
      if (!productInfo) return null;

      const views = viewsMap.get(productId) ?? 0;
      const cartAdds = cartsMap.get(productId) ?? 0;
      const orderData = ordersMap.get(productId) ?? { orders: 0, revenue: 0 };

      const viewToCartRate = views > 0 ? Math.round((cartAdds / views) * 10000) / 100 : 0;
      const cartToOrderRate = cartAdds > 0 ? Math.round((orderData.orders / cartAdds) * 10000) / 100 : 0;

      return {
        productId,
        name: productInfo.name,
        slug: productInfo.slug,
        views,
        cartAdds,
        orders: orderData.orders,
        revenue: orderData.revenue,
        viewToCartRate,
        cartToOrderRate,
      };
    })
    .filter((item): item is ProductPerformanceItem => item !== null);

  // Рассчитываем totals
  const totalViews = performanceItems.reduce((sum, p) => sum + p.views, 0);
  const totalCartAdds = performanceItems.reduce((sum, p) => sum + p.cartAdds, 0);
  const totalOrders = performanceItems.reduce((sum, p) => sum + p.orders, 0);
  const totalRevenue = performanceItems.reduce((sum, p) => sum + p.revenue, 0);

  const avgViewToCartRate = totalViews > 0 ? Math.round((totalCartAdds / totalViews) * 10000) / 100 : 0;
  const avgCartToOrderRate = totalCartAdds > 0 ? Math.round((totalOrders / totalCartAdds) * 10000) / 100 : 0;

  return {
    products: performanceItems,
    period: {
      from: from.toISOString(),
      to: now.toISOString(),
      days,
    },
    totals: {
      totalViews,
      totalCartAdds,
      totalOrders,
      totalRevenue,
      avgViewToCartRate,
      avgCartToOrderRate,
    },
  };
}
