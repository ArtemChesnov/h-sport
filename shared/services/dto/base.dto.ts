// Размеры — копия enum Size из Prisma
export type SizeDto =
    | "XXS"
    | "XS"
    | "S"
    | "M"
    | "L"
    | "XL"
    | "XXL"
    | "ONE_SIZE";

// Статус заказа
export type OrderStatusDto =
    | "NEW"
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED";

// Статус платежа
export type PaymentStatusDto =
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED";

// Способ доставки
export type DeliveryMethodDto =
    | "CDEK_PVZ"
    | "CDEK_COURIER"
    | "POCHTA_PVZ"
    | "POCHTA_COURIER"
    | "PICKUP_SHOWROOM";

// Тип промокода
export type PromoTypeDto = "PERCENT" | "AMOUNT";

// Метаданные пагинации
export type PaginationMetaDto = {
  page: number; // текущая страница
  perPage: number; // сколько элементов на страницу
  total: number; // всего элементов в выборке
  pages: number; // всего страниц (ceil(total / perPage))
  hasNext?: boolean; // есть ли следующая страница (опционально для обратной совместимости)
  hasPrev?: boolean; // есть ли предыдущая страница (опционально для обратной совместимости)
};
