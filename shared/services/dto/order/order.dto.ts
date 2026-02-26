
import type {
    DeliveryMethodDto,
    OrderStatusDto,
    PaginationMetaDto,
    PaymentStatusDto,
} from "../base.dto";

/**
 * Краткая информация о заказе для списка в личном кабинете.
 *
 * Используется в:
 *  - GET /api/shop/orders.
 */
export type OrderShortDto = {
  id: number; // внутренний номер заказа (Order.id)
  uid: string; // публичный идентификатор (Order.uid), можно использовать в URL

  status: OrderStatusDto; // статус заказа: NEW / PAID / SHIPPED / ...
  createdAt: string; // дата создания заказа в ISO-формате

  total: number; // итоговая сумма заказа (total, в копейках)
  totalItems: number; // общее количество штук в заказе (totalItems)
  itemsCount: number; // количество разных позиций (OrderItem[])

  firstItemName: string; // название первого товара (для превью в списке)

  deliveryMethod?: DeliveryMethodDto | null; // способ доставки (если уже задан)
  deliveryAddress?: string | null; // форматированный адрес (город, улица и т.д.)
  trackingCode?: string | null; // трек-номер отправления, если назначен

  itemImageUrls: string[]; // до 3 изображений товаров для превью
};

/**
 * Ответ /api/shop/orders.
 * Список заказов пользователя для личного кабинета с пагинацией.
 */
export type OrdersListResponseDto = {
  items: OrderShortDto[];
  meta: PaginationMetaDto;
};

/**
 * DTO блока доставки при создании заказа.
 *
 * Используется внутри OrderCreateRequestDto.
 * Это минимальный набор полей, чтобы оформить заказ.
 */
export type OrderCreateDeliveryDto = {
  method: DeliveryMethodDto; // способ доставки (CDEK_PVZ, CDEK_COURIER, ...)

  /**
   * Город доставки.
   * Для курьера и Почты — обязателен,
   * для самовывоза / шоурума может быть null.
   */
  city?: string | null;

  /**
   * Адрес:
   *  - для курьера: обычный адрес (улица, дом, кв.);
   *  - для ПВЗ: адрес/название ПВЗ;
   *  - для самовывоза: адрес точки самовывоза.
   */
  address?: string | null;
};

/**
 * Тело запроса на создание заказа.
 *
 * POST /api/shop/orders.
 *
 * Заказ создаётся на основании текущей корзины (по cart_token в cookie).
 * В этом DTO фронт передаёт контактные данные и сведения о доставке.
 */
export type OrderCreateRequestDto = {
  email: string; // e-mail покупателя (для писем/чека)

  phone?: string | null; // телефон для связи / доставки (опционально)
  fullName?: string | null; // ФИО (опционально, можно использовать в документах)

  delivery: OrderCreateDeliveryDto; // блок с данными по доставке

  /**
   * Промокод, если пользователь применил его на шаге checkout.
   * Сейчас можно игнорировать на бэке и опираться на корзину,
   * где промокод уже прикреплён.
   */
  promoCode?: string | null;
};

/**
 * Ответ на успешное создание заказа.
 *
 * Используется сразу после checkout, чтобы показать:
 *  - номер заказа;
 *  - статус;
 *  - дату;
 *  - сумму.
 */
export type OrderCreateResponseDto = {
  id: number; // внутренний номер заказа (Order.id)
  uid: string; // публичный uid (можно использовать в ссылках)
  status: OrderStatusDto; // текущий статус заказа

  total: number; // итоговая сумма (в копейках)
  totalItems: number; // суммарное количество штук

  createdAt: string; // дата создания заказа в ISO-формате
};

/**
 * Одна позиция заказа (OrderItem).
 *
 * Используется в деталке заказа (OrderDetailDto).
 */
export type OrderItemDto = {
  productId: number; // FK на Product.id (для отчётов / перехода на карточку)
  productName: string; // название товара на момент покупки
  sku: string | null; // артикул варианта (если был)
  color: string | null; // цвет варианта
  size: string | null; // размер варианта (как строка, не enum)

  qty: number; // количество штук в заказе
  price: number; // цена за единицу (в копейках)
  total: number; // итог по позиции (qty * price, в копейках)

  productImageUrl: string | null; // маленький превьюшный урл товара на момент покупки
};

/**
 * Информация о доставке (Delivery) для заказа.
 */
export type OrderDeliveryDto = {
  method: DeliveryMethodDto; // способ доставки
  city?: string | null; // город (если есть)
  address?: string | null; // адрес / ПВЗ / шоурум

  trackingCode?: string | null; // трек-номер отправления (если задан)
  price: number; // стоимость доставки (в копейках)
};

/**
 * Детальная информация о заказе для страницы "Мой заказ" в ЛК
 * и для админки (через OrderAdminUpdateResponseDto).
 *
 * Используется в:
 *  - GET /api/shop/orders/[uid];
 *  - GET /api/(admin)/orders/[id];
 *  - PATCH /api/(admin)/orders/[id].
 */
export type OrderDetailDto = {
  id: number; // внутренний номер заказа
  uid: string; // публичный идентификатор

  status: OrderStatusDto; // текущий статус

  email: string; // e-mail покупателя (для писем/уведомлений)
  phone?: string | null; // телефон (если указан)
  fullName?: string | null; // ФИО (если указано)

  totalItems: number; // суммарное количество штук
  subtotal: number; // сумма товаров без скидок и доставки (копейки)
  discount: number; // размер скидки (копейки)
  deliveryFee: number; // стоимость доставки (копейки)
  total: number; // итоговая сумма к оплате (копейки)

  /**
   * Код промокода, применённого к заказу на момент оформления.
   * Например: "WELCOME10" или null.
   */
  promoCode?: string | null;

  createdAt: string; // дата создания заказа (ISO-строка)

  delivery?: OrderDeliveryDto | null; // информация о доставке (может быть null)
  items: OrderItemDto[]; // позиции заказа
  payments?: OrderPaymentDto[]; // информация о платежах (для админки)
};

/**
 * Информация о платеже для заказа
 */
export type OrderPaymentDto = {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatusDto;
  method: string;
  receiptUrl?: string | null; // URL чека об оплате
  createdAt: string;
};

/**
 * Ответ на успешную отмену заказа пользователем.
 *
 * Используется в:
 *  - POST /api/shop/orders/[uid]/cancel.
 */
export type OrderCancelResponseDto = {
  id: number; // внутренний номер заказа
  uid: string; // публичный идентификатор заказа
  status: OrderStatusDto; // новый статус заказа (ожидается "CANCELED")
};
