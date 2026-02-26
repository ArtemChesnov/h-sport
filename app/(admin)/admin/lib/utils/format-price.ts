/**
 * Форматирование цены (копейки → "1 990").
 */
export function formatPrice(price: number | undefined | null): string {
    if (typeof price !== "number") return "—";

    return (price / 100).toLocaleString("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}