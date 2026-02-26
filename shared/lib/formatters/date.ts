/**
 * Форматирование дат
 */

/** Опции для московского часового пояса */
export const DATE_LOCALE_MOSCOW = {
  timeZone: "Europe/Moscow" as const,
};

/**
 * Относительная дата: "Сегодня", "Вчера", "N дня назад" или полная дата.
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дня назад`;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Дата рождения для ЛК: "21 января 1995 г."
 */
export function formatBirthDateDisplay(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...DATE_LOCALE_MOSCOW,
  }) + " г.";
}

/**
 * Краткая дата: 01 янв. 2025
 */
export function formatShortDate(
  dateString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...DATE_LOCALE_MOSCOW,
    ...options,
  });
}

/**
 * Дата и время для карточки заказа: "15:20, 19 января, 2026"
 */
export function formatOrderCardDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...DATE_LOCALE_MOSCOW,
  });
  const datePart = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...DATE_LOCALE_MOSCOW,
  });
  return `${time}, ${datePart}`;
}

/**
 * Только дата для карточки заказа на узких экранах: "26.02.2005"
 */
export function formatOrderCardDateOnly(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...DATE_LOCALE_MOSCOW,
  });
}

/**
 * Дата и время для таблиц.
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...DATE_LOCALE_MOSCOW,
  });
}
