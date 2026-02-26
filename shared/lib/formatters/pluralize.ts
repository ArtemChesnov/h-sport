/**
 * Утилита для склонения слов в русском языке
 *
 * @example
 * pluralize(1, 'пользователь', 'пользователя', 'пользователей') // 'пользователь'
 * pluralize(2, 'пользователь', 'пользователя', 'пользователей') // 'пользователя'
 * pluralize(5, 'пользователь', 'пользователя', 'пользователей') // 'пользователей'
 */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const absCount = Math.abs(count);
  const mod10 = absCount % 10;
  const mod100 = absCount % 100;

  // Числа от 11 до 19 всегда используют форму "many"
  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }

  // 1, 21, 31, ... -> one
  if (mod10 === 1) {
    return one;
  }

  // 2, 3, 4, 22, 23, 24, ... -> few
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }

  // 0, 5, 6, 7, 8, 9, 10, 11-19, 20, 25, ... -> many
  return many;
}

/**
 * Возвращает число со склонённым словом
 *
 * @example
 * pluralizeWithCount(5, 'товар', 'товара', 'товаров') // '5 товаров'
 */
export function pluralizeWithCount(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  return `${count} ${pluralize(count, one, few, many)}`;
}
