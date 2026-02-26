/**
 * Генератор SKU (артикулов) для товаров и их вариантов.
 *
 * Важно:
 * Этот модуль намеренно НЕ зависит от:
 * - DTO (алиасы "@/..." ломают запуск seed-скриптов)
 * - Prisma enum (чтобы не тянуть слой БД в shared-код)
 *
 * Поэтому размер принимаем как строку (или SizeCode), а внутри просто нормализуем.
 */

/**
 * Базовый набор размеров, используемых в проекте.
 * Можно передавать и любые другие строки — генерация не сломается.
 */
export type SizeCode = "XXS" | "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONE_SIZE" | "NS";

/**
 * Доп. информация для генерации "умного" SKU.
 */
export type SkuMeta = {
  categorySlug?: string;
  color?: string;
  size?: SizeCode | string;
};

/**
 * Внутренний хелпер для нормализации кода (категория/цвет).
 *
 * 1) Если ничего не передали — сразу возвращаем fallback.
 * 2) Убираем диакритику (для латиницы с акцентами).
 * 3) Оставляем только [A-Z0-9].
 * 4) Переводим в upper case.
 * 5) Ограничиваем длину maxLen.
 * 6) Если всё вычистили до пустой строки — возвращаем fallback.
 */
function makeCode(source: string | undefined, maxLen: number, fallback: string): string {
  if (!source) return fallback;

  const cleaned = source
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase();

  if (!cleaned) return fallback;

  return cleaned.slice(0, maxLen);
}

/**
 * Генерация базового SKU продукта.
 *
 * Формат:
 *   HS-<CAT>-<PPPP>
 *
 * Где:
 *   HS   — префикс бренда (h-sport)
 *   CAT  — код категории (3 символа, из categorySlug или "GEN")
 *   PPPP — productId с ведущими нулями до 4 символов
 */
export function generateProductSku(productId: number, meta: Pick<SkuMeta, "categorySlug">): string {
  const categoryCode = makeCode(meta.categorySlug, 3, "GEN");
  const productPart = String(productId).padStart(4, "0");
  return `HS-${categoryCode}-${productPart}`;
}

/**
 * Генерация SKU варианта товара на основе базового SKU продукта.
 *
 * Формат:
 *   <BASE>-<SIZE>-<COL>-<VV>
 *
 * Например:
 *   HS-TOP-0001-S-BLK-01
 *
 * Где:
 *   BASE — базовый sku продукта (HS-TOP-0001)
 *   SIZE — размер (S, M, L, ONE_SIZE и т.п.)
 *   COL  — код цвета (3 символа, из color или "CLR")
 *   VV   — порядковый номер варианта внутри товара (01, 02...)
 */
export function generateVariantSku(baseSku: string, index: number, meta: Omit<SkuMeta, "categorySlug">): string {
  const sizeCode = (meta.size ?? "NS").toString().toUpperCase();
  const colorCode = makeCode(meta.color, 3, "CLR");
  const variantPart = String(index + 1).padStart(2, "0");

  return `${baseSku}-${sizeCode}-${colorCode}-${variantPart}`;
}

/**
 * Совместимая обёртка "одной функцией".
 *
 * Используется в seed-скриптах и там, где удобно не помнить две функции.
 *
 * Формат результата такой же:
 *   HS-<CAT>-<PPPP>-<SIZE>-<COL>-<VV>
 */
export function generateSku(productId: number, variantIndex: number, meta: SkuMeta): string {
  const baseSku = generateProductSku(productId, { categorySlug: meta.categorySlug });
  return generateVariantSku(baseSku, variantIndex, { color: meta.color, size: meta.size });
}
