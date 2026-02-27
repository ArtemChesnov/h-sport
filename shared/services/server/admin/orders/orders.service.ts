/**
 * Админка: список заказов, деталка, обновление заказа.
 */

import { prisma } from "@/prisma/prisma-client";
import { buildPaginatedResponse, calculateSkip } from "@/shared/lib/pagination";
import type * as DTO from "@/shared/services/dto";
import { mapOrderToDetailDto } from "./order-mappers";
import { loadOrderById } from "./order-loaders";
import {
  createOrderEvents,
  prepareOrderEvents,
  prepareOrderUpdate,
  syncOrderStatusIfPaid,
  updateOrderInTransaction,
} from "./order-update";

export type { OrderWithRelations } from "./order-types";
export { loadOrderById } from "./order-loaders";
export { mapOrderToDetailDto } from "./order-mappers";
export {
  prepareOrderUpdate,
  prepareOrderEvents,
  syncOrderStatusIfPaid,
  updateOrderInTransaction,
} from "./order-update";

export type AdminOrdersListParams = {
  status?: DTO.OrderStatusDto | null;
  email?: string | null;
  phone?: string | null;
  uid?: string | null;
  q?: string;
  page: number;
  perPage: number;
};

/**
 * Список заказов с фильтрами и пагинацией.
 */
export async function getAdminOrdersList(
  params: AdminOrdersListParams
): Promise<DTO.AdminOrdersListResponseDto> {
  const where: {
    status?: DTO.OrderStatusDto;
    email?: { contains: string; mode: "insensitive" };
    phone?: { contains: string; mode: "insensitive" };
    uid?: string;
    OR?: Array<{
      uid?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
      phone?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (params.status) where.status = params.status;
  if (params.email) where.email = { contains: params.email, mode: "insensitive" };
  if (params.phone) where.phone = { contains: params.phone, mode: "insensitive" };
  if (params.uid) where.uid = params.uid;
  if (params.q) {
    where.OR = [
      { uid: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: calculateSkip(params.page, params.perPage),
    take: params.perPage,
    select: {
      id: true,
      uid: true,
      status: true,
      createdAt: true,
      total: true,
      totalItems: true,
      email: true,
      phone: true,
      fullName: true,
      delivery: {
        select: { method: true, trackingCode: true },
      },
      payments: {
        select: { status: true },
      },
    },
  });

  const items: DTO.AdminOrderListItemDto[] = orders.map((order) => {
    const hasPaidPayment = order.payments.some((p) => p.status === "PAID");
    return {
      id: order.id,
      uid: order.uid,
      status: order.status as DTO.OrderStatusDto,
      createdAt: order.createdAt.toISOString(),
      total: order.total,
      totalItems: order.totalItems,
      email: order.email,
      phone: order.phone,
      fullName: order.fullName,
      deliveryMethod: order.delivery?.method as DTO.DeliveryMethodDto | null,
      trackingCode: order.delivery?.trackingCode ?? null,
      hasPaidPayment,
    };
  });

  return buildPaginatedResponse(items, total, params.page, params.perPage);
}

/**
 * Деталка заказа по id (с автосинхронизацией статуса при оплате).
 */
export async function getAdminOrderDetail(id: number): Promise<DTO.OrderDetailDto | null> {
  const order = await loadOrderById(id);
  if (!order) return null;
  const synced = await syncOrderStatusIfPaid(order);
  return mapOrderToDetailDto(synced);
}

/**
 * Обновление заказа админом. Возвращает обновлённый заказ или ошибку валидации.
 */
export async function updateAdminOrder(
  id: number,
  body: DTO.OrderAdminUpdateRequestDto
): Promise<{ ok: true; order: DTO.OrderDetailDto } | { ok: false; validationError: string }> {
  const existing = await loadOrderById(id);
  if (!existing) {
    return { ok: false, validationError: "Заказ не найден" };
  }

  const syncedExisting = await syncOrderStatusIfPaid(existing);
  const currentStatus = syncedExisting.status as DTO.OrderStatusDto;

  const updateResult = prepareOrderUpdate(body, syncedExisting);
  if (updateResult.validationError) {
    return { ok: false, validationError: updateResult.validationError };
  }

  const {
    orderData,
    deliveryPatch,
    newStatus,
    statusChangedExplicitly,
    trackingChanged,
    hasOrderChanges,
    hasDeliveryChanges,
  } = updateResult;

  if (!hasOrderChanges && !hasDeliveryChanges) {
    return { ok: true, order: mapOrderToDetailDto(syncedExisting) };
  }

  const eventsData = prepareOrderEvents(
    currentStatus,
    newStatus,
    syncedExisting.id,
    statusChangedExplicitly,
    trackingChanged,
    syncedExisting.delivery?.trackingCode ?? null,
    deliveryPatch.trackingCode
  );

  const updatedOrder = await updateOrderInTransaction(
    syncedExisting.id,
    orderData,
    deliveryPatch,
    hasDeliveryChanges,
    syncedExisting.delivery,
    syncedExisting.deliveryFee
  );

  await createOrderEvents(eventsData);

  if (newStatus !== currentStatus) {
    try {
      const { sendOrderStatusChangeEmailAsync } = await import("@/modules/auth/lib/email");
      const { ADMIN_ORDER_STATUS_OPTIONS } = await import("@/shared/constants");
      const statusLabel =
        ADMIN_ORDER_STATUS_OPTIONS.find((opt) => opt.value === newStatus)?.label || newStatus;
      sendOrderStatusChangeEmailAsync(updatedOrder.email, {
        id: updatedOrder.id,
        uid: updatedOrder.uid,
        status: newStatus,
        statusLabel,
        trackingCode: updatedOrder.delivery?.trackingCode ?? null,
      });
    } catch (emailError) {
      const { logger } = await import("@/shared/lib/logger");
      logger.error("updateAdminOrder: Ошибка при отправке email об изменении статуса", emailError);
    }
  }

  return { ok: true, order: mapOrderToDetailDto(updatedOrder) };
}
