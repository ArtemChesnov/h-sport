/**
 * Переиспользуемые CSS-классы для UI
 */

/** Стандартное поле ввода (форма, чекаут, ЛК). При 576px и ниже — текст 14px. */
export const INPUT_FIELD_CLASS =
  "h-11 w-full rounded-[10px] border border-input bg-background px-3 text-[16px] max-[576px]:text-[14px] leading-[130%] outline-none transition-[border-color,box-shadow] duration-200 ease-out disabled:opacity-70 disabled:cursor-not-allowed aria-invalid:border-destructive focus:ring-2 focus:ring-primary/20";

/** Метка поля формы (чекаут, формы). Минимум 14px. */
export const INPUT_LABEL_CLASS =
  "block font-normal text-[14px] leading-[130%] uppercase text-muted-foreground";

/** Заголовок секции (checkout, формы) */
export const SECTION_HEADING_CLASS =
  "text-[22px] max-[1440px]:text-[20px] max-[1024px]:text-[18px] font-semibold uppercase tracking-[0.08em]";

/** Метка в блоке заказа (Получатель, Адрес и т.д.). Минимум 14px. */
export const ORDER_LABEL_CLASS = "text-[14px] font-medium";

/** Значение в блоке заказа */
export const ORDER_VALUE_CLASS = "text-[14px] font-light leading-[130%]";

/** Метка в summary (Товары, Доставка, Промокод). Адаптив как в корзине. */
export const SUMMARY_LABEL_CLASS =
  "text-[20px] max-[1024px]:text-[18px] max-[576px]:text-[16px] font-normal text-text-secondary";

/** Значение в summary (цена). Те же размеры, что и метка «Товары», на всех разрешениях. */
export const SUMMARY_VALUE_CLASS =
  "text-[20px] max-[1024px]:text-[18px] max-[576px]:text-[16px] font-normal text-[#EB6081]";

/** Лейблы для блока summary */
export const SUMMARY_LABELS = {
  items: "Товары",
  delivery: "Доставка",
  promo: "Промокод",
  total: "Итого",
} as const;

/** Единый стиль контента модалок магазина: премиальный вид, best practices отступов */
export const SHOP_MODAL_CONTENT_CLASS =
  "max-w-md w-full rounded-2xl border border-border bg-card shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)] p-6 sm:p-8";

/** Заголовок модалки магазина */
export const SHOP_MODAL_TITLE_CLASS =
  "text-[22px] font-semibold leading-tight tracking-tight text-foreground sm:text-[28px]";

/** Описание/подзаголовок модалки магазина */
export const SHOP_MODAL_DESCRIPTION_CLASS =
  "text-[16px] font-normal leading-[150%] text-muted-foreground";

/** Отступ контента под заголовком (единый gap между блоками) */
export const SHOP_MODAL_BODY_GAP = "gap-6 pt-2";

/** Заголовок блока ошибки / пустого состояния (магазин) */
export const SHOP_ERROR_EMPTY_TITLE_CLASS =
  "font-heading text-[28px] sm:text-[32px] font-semibold leading-[120%] uppercase text-foreground";

/** Описание блока ошибки / пустого состояния (магазин) */
export const SHOP_ERROR_EMPTY_DESCRIPTION_CLASS =
  "text-[16px] font-normal leading-[150%] text-text-secondary";

/** Контейнер блока ошибки / пустого состояния: фон и отступы */
export const SHOP_ERROR_EMPTY_CONTAINER_CLASS =
  "flex items-center justify-center p-6 sm:p-10 bg-background";

/** Иконка в круге (ошибка) — акцент primary */
export const SHOP_ERROR_ICON_WRAPPER_CLASS =
  "mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center";
export const SHOP_ERROR_ICON_CLASS = "h-8 w-8 text-primary";
