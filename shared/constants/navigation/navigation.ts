/**
 * Ссылки навигации меню магазина.
 */

export const MENU_PRIMARY_LINKS = [
  { label: "О нас", href: "/about" },
  { label: "Новинки", href: "/" },
  { label: "Бестселлеры", href: "/" },
  { label: "Подарочный сертификат", href: "/certificate" },
  { label: "Шоурум", href: "/showroom" },
] as const;

export const MENU_CUSTOMER_LINKS = [
  { label: "Оплата и доставка", href: "/payment-delivery" },
  { label: "Обмен и возврат", href: "/payment-delivery#обмен-и-возврат" },
  { label: "Размерная сетка", href: "/", target: "_blank" as const },
  { label: "Правила продажи", href: "/sales-rules" },
  { label: "Политика конфиденциальности", href: "/privacy", target: "_blank" as const },
] as const;
