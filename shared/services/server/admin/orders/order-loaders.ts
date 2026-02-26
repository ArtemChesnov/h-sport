/**
 * Загрузка заказа по ID (admin)
 */

import { prisma } from "@/prisma/prisma-client";
import type { OrderWithRelations } from "./order-types";
import { ORDER_SELECT } from "./order-types";

export async function loadOrderById(id: number): Promise<OrderWithRelations | null> {
  return prisma.order.findUnique({
    where: { id },
    select: ORDER_SELECT,
  }) as Promise<OrderWithRelations | null>;
}
