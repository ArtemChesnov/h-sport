/**
 * Утилиты для стилизации статусов заказов
 * Централизованное место для всех стилей статусов
 */

import type * as DTO from "@/shared/services/dto";
import { CheckCircle, Clock, Package, Truck, XCircle, type LucideIcon } from "lucide-react";

/** Единый источник меток статусов заказа (краткая форма для таблиц/бейджей) */
export const ORDER_STATUS_LABELS: Record<DTO.OrderStatusDto, string> = {
  NEW: "Новый",
  PENDING_PAYMENT: "Ожидает оплаты",
  PAID: "Оплачен",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELED: "Отменён",
};

/** Расширенная форма меток для форм/селектов (более описательная) */
export const ORDER_STATUS_LABELS_FORM: Record<DTO.OrderStatusDto, string> = {
  ...ORDER_STATUS_LABELS,
  SHIPPED: "Передан в доставку",
};

/**
 * Возвращает CSS-классы для бейджа статуса заказа
 */
export function getOrderStatusBadgeStyles(status: DTO.OrderStatusDto): string {
  const styles: Record<DTO.OrderStatusDto, string> = {
    NEW: "bg-gradient-to-r from-slate-100 to-zinc-100 text-slate-700 border border-slate-200/60 shadow-sm",
    PENDING_PAYMENT:
      "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200/60 shadow-sm",
    PAID: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60 shadow-sm",
    PROCESSING:
      "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/60 shadow-sm",
    SHIPPED:
      "bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 border border-indigo-200/60 shadow-sm",
    DELIVERED:
      "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/60 shadow-sm",
    CANCELED:
      "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/60 shadow-sm",
  };
  return styles[status] ?? styles.NEW;
}

/**
 * Возвращает человекочитаемую метку для статуса заказа
 */
export function getOrderStatusLabel(status: DTO.OrderStatusDto): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

/** Цвет и иконка для статуса (для ЛК, карточки заказов) */
export type OrderStatusInfo = {
  label: string;
  color: string;
  icon: LucideIcon;
};

const ORDER_STATUS_INFO: Record<DTO.OrderStatusDto, { color: string; icon: LucideIcon }> = {
  NEW: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: Clock },
  PENDING_PAYMENT: {
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: Clock,
  },
  PAID: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  PROCESSING: {
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: Package,
  },
  SHIPPED: {
    color: "text-purple-600 bg-purple-50 border-purple-200",
    icon: Truck,
  },
  DELIVERED: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle,
  },
  CANCELED: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: XCircle,
  },
};

/**
 * Возвращает метку, цвет и иконку для статуса заказа (ЛК).
 */
export function getOrderStatusInfo(status: DTO.OrderStatusDto): OrderStatusInfo {
  const info = ORDER_STATUS_INFO[status] ?? {
    color: "text-neutral-600 bg-neutral-50 border-neutral-200",
    icon: Clock,
  };
  return {
    label: getOrderStatusLabel(status),
    ...info,
  };
}

/** Единый источник меток способов доставки */
export const DELIVERY_METHOD_LABELS: Record<DTO.DeliveryMethodDto, string> = {
  CDEK_PVZ: "СДЭК — пункт выдачи",
  CDEK_COURIER: "СДЭК — курьер",
  POCHTA_PVZ: "Почта России — отделение",
  POCHTA_COURIER: "Почта России — курьер",
  PICKUP_SHOWROOM: "Самовывоз из шоурума",
};

/**
 * Возвращает метку способа доставки.
 */
export function getDeliveryMethodLabel(method?: DTO.DeliveryMethodDto | null): string {
  if (!method) return "Способ доставки не задан";
  return DELIVERY_METHOD_LABELS[method] ?? method;
}

/**
 * Возвращает CSS-классы для бейджа статуса платежа
 */
export function getPaymentStatusBadgeStyles(status: DTO.PaymentStatusDto): string {
  const styles: Record<DTO.PaymentStatusDto, string> = {
    PAID: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60 shadow-sm",
    PENDING:
      "bg-gradient-to-r from-slate-100 to-zinc-100 text-slate-700 border border-slate-200/60 shadow-sm",
    FAILED:
      "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/60 shadow-sm",
    CANCELED:
      "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/60 shadow-sm",
    REFUNDED:
      "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200/60 shadow-sm",
  };
  return styles[status] ?? styles.PENDING;
}

/**
 * Возвращает человекочитаемую метку для статуса платежа
 */
export function getPaymentStatusLabel(status: DTO.PaymentStatusDto): string {
  const labels: Record<DTO.PaymentStatusDto, string> = {
    PAID: "Оплачен",
    PENDING: "Ожидает",
    FAILED: "Ошибка",
    CANCELED: "Отменён",
    REFUNDED: "Возврат",
  };
  return labels[status] ?? status;
}

/**
 * Возвращает человекочитаемую метку для способа оплаты
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    CARD: "Банковская карта",
    SBP: "СБП",
    BNPL: "Оплата долями",
    AUTO: "Будет выбран при оплате",
  };
  return labels[method] ?? (method || "Будет выбран при оплате");
}
