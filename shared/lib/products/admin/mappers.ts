import { DTO } from "@/shared/services";
import { generateProductSku } from "@/shared/lib/generators";

/**
 * Маппинг Prisma -> DTO для списка админки.
 *
 * Важно:
 * - SKU у тебя лежит на уровне ProductItem, а в списке товара нам нужен "SKU товара".
 * - Так как базовый SKU не хранится в Product, мы вычисляем его детерминированно:
 *   generateProductSku(product.id, { categorySlug })
 *
 * Это гарантирует:
 * - одинаковый SKU товара на фронте/бэке;
 * - не зависит от наличия/отсутствия sku у вариантов.
 */
export function mapToAdminListItemDto(product: {
  id: number;
  slug: string;
  name: string;
  categoryId: number;
  category: { name: string; slug: string };
  images: string[] | null;
  items: Array<{ price: number; isAvailable: boolean; imageUrls: string[] }>;
  createdAt: Date;
}): DTO.AdminProductListItemDto {
  const itemsCount = product.items.length;
  const hasItems = itemsCount > 0;

  const isAvailableOverall = product.items.some((i) => i.isAvailable);

  const prices = product.items.map((i) => i.price);
  const priceMin = prices.length ? Math.min(...prices) : null;
  const priceMax = prices.length ? Math.max(...prices) : null;

  // 🔥 Базовый SKU товара (вместо slug в UI)
  const sku = generateProductSku(product.id, {
    categorySlug: product.category.slug,
  });

  // Превью-изображение: приоритет product.images[0] > первый вариант с изображением
  let previewImage: string | null = null;
  if (product.images && product.images.length > 0 && product.images[0]) {
    previewImage = product.images[0];
  } else {
    const variantWithImages = product.items.find((item) => item.imageUrls && item.imageUrls.length > 0);
    previewImage = variantWithImages?.imageUrls[0] ?? null;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    sku,

    categoryId: product.categoryId,
    categoryName: product.category.name,

    hasItems,
    itemsCount,
    isAvailableOverall,

    priceMin,
    priceMax,

    previewImage,

    createdAt: product.createdAt.toISOString(),
  };
}
