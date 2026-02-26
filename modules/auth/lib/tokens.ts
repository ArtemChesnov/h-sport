/**
 * Утилиты для работы с токенами
 */

import { randomBytes, createHash } from "crypto";

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY_HOURS = 24;

/**
 * Генерирует случайный токен (raw token для отправки в email)
 */
export function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString("hex");
}

/**
 * Хеширует токен для безопасного хранения в БД
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Вычисляет срок действия токена
 */
export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
  return expiry;
}

/**
 * Проверяет, не истёк ли токен
 */
export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires;
}
