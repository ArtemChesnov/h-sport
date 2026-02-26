
import type {
  DeliveryMethodDto,
  OrderStatusDto,
  PaginationMetaDto,
} from "../base.dto";
import type { OrderDetailDto } from "../order/order.dto";

/**
 * Тело запроса на обновление заказа из админки.
 *
 * Используется в:
 *  - PATCH /api/(admin)/orders/[id].
 *
 * Все поля опциональны — обновляются только переданные.
 */
export type OrderAdminUpdateRequestDto = {
  status?: OrderStatusDto; // новый статус заказа

  email?: string; // e-mail покупателя
  phone?: string | null; // телефон (может быть очищен до null)
  fullName?: string | null; // ФИО (может быть очищено до null)

  deliveryMethod?: DeliveryMethodDto; // способ доставки
  deliveryCity?: string | null; // город доставки
  deliveryAddress?: string | null; // адрес / ПВЗ / самовывоз

  trackingCode?: string | null; // трек-номер отправления
};

/**
 * Ответ на обновление заказа из админки.
 *
 * По форме совпадает с OrderDetailDto.
 */
export type OrderAdminUpdateResponseDto = OrderDetailDto;

/**
 * Параметры фильтрации/поиска заказов в админке.
 *
 * Используется в:
 *  - GET /api/(admin)/orders.
 */
export type AdminOrdersQueryDto = {
  page?: number;
  perPage?: number;

  status?: OrderStatusDto;
  email?: string;
  phone?: string;
  uid?: string;
  q?: string; // общий поиск по uid/email/телефону
};

/**
 * Одна строка в списке заказов админки.
 */
export type AdminOrderListItemDto = {
  id: number;
  uid: string;

  status: OrderStatusDto;
  createdAt: string;

  total: number;
  totalItems: number;

  email: string;
  phone?: string | null;
  fullName?: string | null;

  // Дополнительная информация для таблицы
  deliveryMethod?: DeliveryMethodDto | null;
  trackingCode?: string | null;
  hasPaidPayment?: boolean; // есть ли оплаченный платеж
};

/**
 * Ответ на GET /api/(admin)/orders.
 */
export type AdminOrdersListResponseDto = {
  items: AdminOrderListItemDto[];
  meta: PaginationMetaDto;
};
