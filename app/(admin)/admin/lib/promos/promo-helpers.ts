/**
 * Рубли -> копейки.
 */
export function rubToKopecks(rub: number): number {
  return Math.round(rub * 100);
}

/**
 * Перевод выбранной даты в ISO:
 * - startsAt: начало дня (00:00:00.000)
 * - endsAt: конец дня (23:59:59.999)
 */
export function toStartOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function toEndOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}



