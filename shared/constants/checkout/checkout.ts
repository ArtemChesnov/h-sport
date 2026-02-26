/**
 * Сообщения об ошибках оплаты (query param ?error=).
 */
export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  payment_failed: "Оплата не была завершена. Пожалуйста, попробуйте снова.",
  payment_canceled: "Оплата была отменена. Вы можете попробовать снова.",
  invalid_signature: "Ошибка проверки платежа. Пожалуйста, свяжитесь с поддержкой.",
  invalid_order: "Заказ не найден. Пожалуйста, создайте новый заказ.",
  payment_error:
    "Произошла ошибка при обработке платежа. Пожалуйста, попробуйте снова.",
} as const;

export const DEFAULT_PAYMENT_ERROR_MESSAGE = "Произошла ошибка при оплате";

/**
 * Способы оплаты на странице чекаута.
 */
export const CHECKOUT_PAYMENT_METHODS = [
  { value: "CARD" as const, label: "Банковская карта" },
  { value: "SBP" as const, label: "СБП (Система быстрых платежей)" },
  { value: "BNPL" as const, label: "Оплата долями" },
] as const;

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number]["value"];

/**
 * Адрес самовывоза из шоурума.
 * Используется в payment page и компонентах чекаута (address-fields, delivery-info).
 */
export const PICKUP_ADDRESS = {
  /** Город для бэка и отображения */
  city: "Нижний Новгород",
  /** Строка адреса для бэка (заказ) */
  addressLine: "Нижний Новгород, ул. Минина (шоурум)",
  /** Краткое отображение в блоке доставки */
  displayShort: "Нижний Новгород, ул. Минина",
  /** Полный адрес в полях формы (ул., д.) */
  displayFull: "Нижний Новгород, ул. Минина, 16а",
  /** Часы работы */
  hours: "Ежедневно с 11:00 до 19:00",
} as const;
