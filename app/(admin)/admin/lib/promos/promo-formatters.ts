import { formatMoney } from "@/shared/lib";
import { DTO } from "@/shared/services";

type PromoType = DTO.PromoTypeDto;

/**
 * Локализация типа промокода для UI.
 */
export function formatPromoType(type?: string | null): string {
  switch (type) {
    case "PERCENT":
      return "Процентный";
    case "AMOUNT":
      return "Сумма";
    default:
      return type ?? "—";
  }
}

/**
 * Формат значения промокода:
 * - PERCENT: "10%"
 * - AMOUNT: "500 ₽" (value в копейках)
 */
export function formatPromoValue(type: PromoType, value: number): string {
  if (type === "PERCENT") return `${value}%`;
  return formatMoney(value);
}

/**
 * Формат даты: "dd.mm.yyyy".
 */
export function formatRuDate(input?: string | Date | null): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Формат периода: "16.12.2025 - 29.12.2025".
 */
export function formatPromoPeriod(
  startsAt?: string | null,
  endsAt?: string | null,
): string {
  if (startsAt && endsAt)
    return `${formatRuDate(startsAt)} - ${formatRuDate(endsAt)}`;
  if (startsAt) return `${formatRuDate(startsAt)} - —`;
  if (endsAt) return `— - ${formatRuDate(endsAt)}`;
  return "—";
}



