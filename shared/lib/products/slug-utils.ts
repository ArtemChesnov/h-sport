/**
 * Утилиты для работы со slug продуктов
 */

import { Prisma } from "@prisma/client";

/**
 * Генерация уникального slug:
 * - если slug уже занят -> добавляем суффикс "-2", "-3", ...
 */
export async function ensureUniqueSlug(
  tx: Prisma.TransactionClient,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug;
  let i = 2;

  while (true) {
    const exists = await tx.product.findUnique({ where: { slug } });
    if (!exists) return slug;

    slug = `${baseSlug}-${i}`;
    i += 1;
  }
}
