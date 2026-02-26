/** Копейки → "6 300 ₽" (nbsp перед ₽). */
export function formatMoney(value: number | null | undefined): string {
    if (typeof value !== "number") return "0\u00A0₽";
    const rub = value / 100;
    return `${rub.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}\u00A0₽`;
}

/**
 * Форматирование цены из копеек в строку с символом валюты (для HTML-писем и серверного рендера).
 * Выводит результат через Intl.NumberFormat с `style: "currency"`.
 *
 * @example formatMoneyHtml(630000) → "6 300 ₽"
 */
export function formatMoneyHtml(kopecks: number): string {
    return (kopecks / 100).toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}
