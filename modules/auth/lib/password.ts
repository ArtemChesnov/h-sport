/**
 * Утилиты для работы с паролями
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Хеширует пароль
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверяет пароль
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
