/**
 * Валидация и проверки для админских заказов
 */

import type * as DTO from "@/shared/services/dto";
import { PaymentStatus } from "@prisma/client";

export function canChangeStatus(current: DTO.OrderStatusDto, next: DTO.OrderStatusDto): boolean {
  if (current === next) return true;
  if (current === "DELIVERED" || current === "CANCELED") return false;
  if (next === "NEW") return false;
  return true;
}

export function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function hasPaidPayment(payments: Array<{ status: PaymentStatus }>): boolean {
  return payments.some((p) => p.status === PaymentStatus.PAID);
}

export const STATUSES_REQUIRING_PAYMENT: DTO.OrderStatusDto[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export const STATUS_LABELS: Record<DTO.OrderStatusDto, string> = {
  PAID: "Оплачен",
  PROCESSING: "В обработке",
  SHIPPED: "Передан в доставку",
  DELIVERED: "Доставлен",
  NEW: "Новый",
  PENDING_PAYMENT: "Ожидает оплаты",
  CANCELED: "Отменён",
};
