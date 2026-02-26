/**
 * Валидация email формата.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) return false;

  // Простая, но эффективная проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Валидация телефона (российский формат).
 * Принимает: +7XXXXXXXXXX, 8XXXXXXXXXX, 7XXXXXXXXXX или только цифры.
 * @returns true если формат валиден
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;

  // Убираем всё кроме цифр и +
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.length === 0) return true; // пустой телефон валиден (опциональное поле)

  // Российский номер: +7 или 8 + 10 цифр
  const phoneRegex = /^(\+7|8|7)?(\d{10})$/;
  return phoneRegex.test(cleaned);
}

/**
 * Нормализует телефон к формату +7XXXXXXXXXX.
 * @returns нормализованный телефон или null если невалидный
 */
export function normalizePhone(phone: string): string | null {
  if (!phone || typeof phone !== "string") return null;

  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.length === 0) return null;

  const match = cleaned.match(/^(\+7|8|7)?(\d{10})$/);
  if (!match) return null;

  return `+7${match[2]}`;
}

/**
 * Валидация даты рождения.
 * @param dateStr - дата в формате YYYY-MM-DD или DD.MM.YYYY
 * @returns true если дата валидна и не в будущем
 */
export function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;

  const trimmed = dateStr.trim();
  if (trimmed.length === 0) return true; // пустая дата валидна (опциональное поле)

  // Парсим YYYY-MM-DD или DD.MM.YYYY
  const date = parseDateString(trimmed);
  if (!date || isNaN(date.getTime())) return false;

  // Дата не должна быть в будущем
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return false;

  // Минимальный возраст: не раньше 1900 года
  if (date.getFullYear() < 1900) return false;

  return true;
}

/**
 * Парсит строку даты в формате YYYY-MM-DD или DD.MM.YYYY.
 * @returns Date или null если невалидный формат
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;

  const trimmed = dateStr.trim();

  // Формат YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    // Проверяем что дата корректна (не 31 февраля и т.п.)
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }
    return null;
  }

  // Формат DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split(".").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }
    return null;
  }

  return null;
}

/**
 * Форматирует Date в строку DD.MM.YYYY для отображения.
 */
export function formatDateDisplay(date: Date | null | undefined): string {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Форматирует Date в строку YYYY-MM-DD для API/input[type=date].
 */
export function formatDateISO(date: Date | null | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Валидация и нормализация поискового запроса.
 * @param query - поисковый запрос
 * @param maxLength - максимальная длина (по умолчанию 200)
 */
export function validateSearchQuery(
  query: string | null | undefined,
  maxLength: number = 200,
): string | null {
  if (!query) return null;

  const trimmed = query.trim();
  if (trimmed.length === 0) return null;

  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

