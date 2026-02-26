/**
 * Логика обновления заказа (admin)
 */

import { prisma } from "@/prisma/prisma-client";
import { DeliveryMethod, OrderStatus, Prisma } from "@prisma/client";
import type { DTO } from "@/shared/services";
import type { DeliveryPatch, OrderUpdateData, OrderWithRelations } from "./order-types";
import { ORDER_SELECT } from "./order-types";
import {
  canChangeStatus,
  hasPaidPayment,
  normalizeNullableString,
  STATUSES_REQUIRING_PAYMENT,
  STATUS_LABELS,
} from "./order-validation";

export async function syncOrderStatusIfPaid(
  order: OrderWithRelations,
): Promise<OrderWithRelations> {
  if (hasPaidPayment(order.payments) && order.status !== "PAID") {
    const previousStatus = order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID, updatedAt: new Date() },
      select: ORDER_SELECT,
    });
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "STATUS_CHANGED",
        payload: {
          from: previousStatus,
          to: "PAID",
          actor: "SYSTEM",
          source: "AUTO_SYNC_ON_PAYMENT",
          reason: "Автоматическая синхронизация: заказ оплачен, но статус не был обновлён",
        } as Prisma.InputJsonValue,
      },
    });
    return updatedOrder as OrderWithRelations;
  }
  return order;
}

export function prepareOrderUpdate(
  body: DTO.OrderAdminUpdateRequestDto,
  existing: OrderWithRelations,
): {
  orderData: OrderUpdateData;
  deliveryPatch: DeliveryPatch;
  newStatus: DTO.OrderStatusDto;
  statusChangedExplicitly: boolean;
  trackingChanged: boolean;
  hasOrderChanges: boolean;
  hasDeliveryChanges: boolean;
  validationError?: string;
} {
  const currentStatus = existing.status as DTO.OrderStatusDto;
  let newStatus: DTO.OrderStatusDto = currentStatus;
  let hasOrderChanges = false;
  let hasDeliveryChanges = false;
  const orderData: OrderUpdateData = {};
  const deliveryPatch: DeliveryPatch = {};
  let statusChangedExplicitly = false;
  let trackingChanged = false;

  if (body.status) {
    const requestedStatus = body.status;
    if (!canChangeStatus(currentStatus, requestedStatus)) {
      return {
        orderData,
        deliveryPatch,
        newStatus: currentStatus,
        statusChangedExplicitly: false,
        trackingChanged: false,
        hasOrderChanges: false,
        hasDeliveryChanges: false,
        validationError: "Недопустимая смена статуса заказа",
      };
    }
    if (STATUSES_REQUIRING_PAYMENT.includes(requestedStatus) && !hasPaidPayment(existing.payments)) {
      return {
        orderData,
        deliveryPatch,
        newStatus: currentStatus,
        statusChangedExplicitly: false,
        trackingChanged: false,
        hasOrderChanges: false,
        hasDeliveryChanges: false,
        validationError: `Нельзя установить статус '${STATUS_LABELS[requestedStatus]}' без подтверждённой оплаты. Заказ должен быть оплачен перед изменением статуса.`,
      };
    }
    newStatus = requestedStatus;
    statusChangedExplicitly = newStatus !== currentStatus;
  }

  if (typeof body.email === "string") {
    const trimmed = body.email.trim();
    if (!trimmed) {
      return {
        orderData,
        deliveryPatch,
        newStatus: currentStatus,
        statusChangedExplicitly: false,
        trackingChanged: false,
        hasOrderChanges: false,
        hasDeliveryChanges: false,
        validationError: "E-mail не может быть пустым",
      };
    }
    orderData.email = trimmed;
    hasOrderChanges = true;
  }
  if (body.phone !== undefined) {
    orderData.phone = normalizeNullableString(body.phone);
    hasOrderChanges = true;
  }
  if (body.fullName !== undefined) {
    orderData.fullName = normalizeNullableString(body.fullName);
    hasOrderChanges = true;
  }

  if (body.deliveryMethod) {
    deliveryPatch.method = body.deliveryMethod as DeliveryMethod;
    hasDeliveryChanges = true;
  }
  if (body.deliveryCity !== undefined) {
    deliveryPatch.city = normalizeNullableString(body.deliveryCity);
    hasDeliveryChanges = true;
  }
  if (body.deliveryAddress !== undefined) {
    deliveryPatch.address = normalizeNullableString(body.deliveryAddress);
    hasDeliveryChanges = true;
  }

  let normalizedTracking: string | null | undefined = undefined;
  if (body.trackingCode !== undefined) {
    normalizedTracking = normalizeNullableString(body.trackingCode);
    deliveryPatch.trackingCode = normalizedTracking;
    trackingChanged = true;
    hasDeliveryChanges = true;
  }

  const isPaidOrProcessing = currentStatus === "PAID" || currentStatus === "PROCESSING";
  const hadTrackingBefore =
    existing.delivery?.trackingCode && existing.delivery.trackingCode.trim().length > 0;
  const hasTrackingNow =
    typeof normalizedTracking === "string" && normalizedTracking.trim().length > 0;
  if (
    !statusChangedExplicitly &&
    !hadTrackingBefore &&
    hasTrackingNow &&
    isPaidOrProcessing
  ) {
    const autoNextStatus: DTO.OrderStatusDto = "SHIPPED";
    if (canChangeStatus(currentStatus, autoNextStatus)) newStatus = autoNextStatus;
  }

  if (newStatus !== currentStatus) {
    orderData.status = newStatus as OrderStatus;
    hasOrderChanges = true;
  }

  return {
    orderData,
    deliveryPatch,
    newStatus,
    statusChangedExplicitly,
    trackingChanged,
    hasOrderChanges,
    hasDeliveryChanges,
  };
}

export function prepareOrderEvents(
  currentStatus: DTO.OrderStatusDto,
  newStatus: DTO.OrderStatusDto,
  orderId: number,
  statusChangedExplicitly: boolean,
  trackingChanged: boolean,
  previousTracking: string | null,
  newTracking: string | null | undefined,
): Prisma.OrderEventCreateManyInput[] {
  const eventsData: Prisma.OrderEventCreateManyInput[] = [];
  if (newStatus !== currentStatus) {
    eventsData.push({
      orderId,
      type: "STATUS_CHANGED",
      payload: {
        from: currentStatus,
        to: newStatus,
        actor: "ADMIN",
        source: statusChangedExplicitly ? "ADMIN_PATCH" : "ADMIN_AUTO_SHIPPED_ON_TRACKING",
      } as Prisma.InputJsonValue,
    });
  }
  if (trackingChanged) {
    eventsData.push({
      orderId,
      type: "TRACKING_UPDATED",
      payload: {
        from: previousTracking,
        to: newTracking ?? null,
        actor: "ADMIN",
      } as Prisma.InputJsonValue,
    });
  }
  return eventsData;
}

export async function updateOrderInTransaction(
  orderId: number,
  orderData: OrderUpdateData,
  deliveryPatch: DeliveryPatch,
  hasDeliveryChanges: boolean,
  existingDelivery: OrderWithRelations["delivery"],
  deliveryFee: number | null,
): Promise<OrderWithRelations> {
  const transaction: Prisma.PrismaPromise<unknown>[] = [];
  transaction.push(
    prisma.order.update({
      where: { id: orderId },
      data: {
        ...orderData,
        ...(hasDeliveryChanges && {
          delivery: existingDelivery
            ? {
                update: {
                  ...(deliveryPatch.method !== undefined && { method: deliveryPatch.method }),
                  ...(deliveryPatch.city !== undefined && { city: deliveryPatch.city }),
                  ...(deliveryPatch.address !== undefined && { address: deliveryPatch.address }),
                  ...(deliveryPatch.trackingCode !== undefined && {
                    trackingCode: deliveryPatch.trackingCode,
                  }),
                },
              }
            : {
                create: {
                  method: deliveryPatch.method ?? DeliveryMethod.CDEK_PVZ,
                  city: deliveryPatch.city ?? null,
                  address: deliveryPatch.address ?? null,
                  trackingCode: deliveryPatch.trackingCode ?? null,
                  price: deliveryFee ?? 0,
                },
              },
        }),
      },
      select: ORDER_SELECT,
    }),
  );
  const [updatedOrder] = (await prisma.$transaction(transaction)) as [OrderWithRelations, unknown?];
  return updatedOrder;
}

export async function createOrderEvents(
  data: Prisma.OrderEventCreateManyInput[],
): Promise<void> {
  if (data.length > 0) {
    await prisma.orderEvent.createMany({ data });
  }
}
