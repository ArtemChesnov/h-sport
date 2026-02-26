import { PrismaClient, Size } from "@prisma/client";
import { generateSku } from "../shared/lib/generators";
import { RAW_PRODUCTS, getImage, getImagesForProduct } from "./constants";
import { RawProduct } from "./types";

/**
 * Генерирует теги для товара на основе его свойств
 */
function generateTags(product: RawProduct, index: number): string[] {
  const tags: string[] = [];

  // Новинка для первых 10 товаров
  if (index <= 10) {
    tags.push("новинка");
  }

  // Хит продаж для каждого 5-го товара
  if (index % 5 === 0) {
    tags.push("хит продаж");
  }

  // Распродажа для товаров с индексом 15-25
  if (index >= 15 && index <= 25) {
    tags.push("распродажа");
  }

  // Рекомендуем для каждого 3-го товара
  if (index % 3 === 0) {
    tags.push("рекомендуем");
  }

  // Популярное для каждого 4-го товара
  if (index % 4 === 0) {
    tags.push("популярное");
  }

  // Теги по категориям
  if (product.categorySlug === "tops" || product.categorySlug === "leggings") {
    if (index % 2 === 0) {
      tags.push("для фитнеса");
    }
  }

  if (product.categorySlug === "dresses-jumpsuits" || product.categorySlug === "outerwear") {
    if (index % 3 === 0) {
      tags.push("для тренировок");
    }
  }

  // Уникальный дизайн для первых 20 товаров
  if (index <= 20 && index % 7 === 0) {
    tags.push("уникальный дизайн");
  }

  return tags;
}

/**
 * Доп. небольшой набор demo-комплектов.
 * Подключаем только если категория "top-leggings-sets" существует.
 */
const RAW_SET_PRODUCTS: RawProduct[] = [
  {
    name: "Комплект топ и леггинсы",
    categorySlug: "top-leggings-sets",
    description: "Комплект из спортивного топа и леггинсов зелёного цвета. Идеален для тренировок и активного отдыха.",
    variations: [
      {
        color: "Зелёный",
        sizes: [Size.S, Size.M, Size.L],
        priceRub: 5800,
        composition: "85% полиамид, 15% эластан",
        isAvailable: true,
      },
    ],
  },
  {
    name: "Комплект топ и леггинсы",
    categorySlug: "top-leggings-sets",
    description: "Классический комплект из чёрного топа и леггинсов. Универсальный вариант для любых тренировок.",
    variations: [
      {
        color: "Чёрный",
        sizes: [Size.S, Size.M, Size.L],
        priceRub: 6200,
        composition: "85% полиамид, 15% эластан",
        isAvailable: true,
      },
    ],
  },
  {
    name: "Комплект топ и леггинсы",
    categorySlug: "top-leggings-sets",
    description: "Элегантный бежевый комплект для тренировок. Нежный цвет и комфортный крой.",
    variations: [
      {
        color: "Бежевый",
        sizes: [Size.S, Size.M, Size.L],
        priceRub: 5800,
        composition: "85% полиамид, 15% эластан",
        isAvailable: true,
      },
    ],
  },
  {
    name: "Комплект топ и леггинсы",
    categorySlug: "top-leggings-sets",
    description: "Яркий розовый комплект для активных тренировок. Стильный дизайн и функциональность.",
    variations: [
      {
        color: "Розовый",
        sizes: [Size.S, Size.M],
        priceRub: 6000,
        composition: "85% полиамид, 15% эластан",
        isAvailable: true,
      },
    ],
  },
];

/**
 * Сидинг товаров:
 * - создаём продукты и варианты (items)
 * - генерируем SKU на каждый вариант
 *
 * Важное правило для размеров:
 * - Если variation.sizes пустой (например, аксессуары) → считаем это ONE_SIZE.
 *
 * ВАЖНО: ВСЕ картинки жёстко захардкожены в DEMO_IMAGE.
 * Любые imageUrls / images из RAW_PRODUCTS игнорируются.
 */
export async function seedProducts(prisma: PrismaClient) {
  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map<string, number>(
      categories.map((c) => [c.slug, c.id]),
  );

  const allProducts: RawProduct[] = [...RAW_PRODUCTS];

  // Добавляем демо-комплекты только если категория реально есть в БД.
  if (categoryIdBySlug.has("top-leggings-sets")) {
    allProducts.push(...RAW_SET_PRODUCTS);
  }

  let productIndex = 1;
  let imageIndex = 0;

  for (const rawProduct of allProducts) {
    const categoryId = categoryIdBySlug.get(rawProduct.categorySlug);

    if (!categoryId) {
      console.warn(
          `[seedProducts] Категория с slug="${rawProduct.categorySlug}" не найдена. ` +
          `Товар "${rawProduct.name}" пропущен.`,
      );
      continue;
    }

    /**
     * Группируем вариации по composition.
     * Если в одном "rawProduct" встречаются разные составы,
     * создаём несколько Product (по одному на состав).
     */
    const variationsByComposition = new Map<string, RawProduct["variations"]>();

    for (const variation of rawProduct.variations) {
      const compositionKey = (variation.composition ?? "").trim() || "—";

      let variations = variationsByComposition.get(compositionKey);
      if (!variations) {
        variations = [];
        variationsByComposition.set(compositionKey, variations);
      }
      variations.push(variation);
    }

    if (variationsByComposition.size === 0) {
      console.warn(
          `[seedProducts] Для товара "${rawProduct.name}" нет ни одной вариации. Пропускаю.`,
      );
      continue;
    }

    for (const [composition, variations] of variationsByComposition) {
      const productItemsToCreate: {
        color: string;
        size: Size;
        price: number;
        isAvailable: boolean;
        imageUrls: string[];
        sku?: string;
      }[] = [];

      const usedColorSizeKeys = new Set<string>();
      let variantIndex = 0;

      for (const variation of variations) {
        // Если sizes пустой — это ONE_SIZE (аксессуары и т.п.)
        const sizesToUse: Size[] =
            variation.sizes && variation.sizes.length > 0
                ? variation.sizes
                : [Size.ONE_SIZE];

        for (const productSize of sizesToUse) {
          const key = `${variation.color}__${productSize}`;

          if (usedColorSizeKeys.has(key)) {
            console.warn(
                `[seedProducts] Дубликат варианта color="${variation.color}", size="${productSize}" ` +
                `в товаре "${rawProduct.name}" (composition="${composition}"). Пропускаю дубликат.`,
            );
            continue;
          }

          usedColorSizeKeys.add(key);

          const sku = generateSku(productIndex, variantIndex, {
            categorySlug: rawProduct.categorySlug,
            color: variation.color,
            size: productSize,
          });

          // Минимум 4 изображения на каждый вариант (для разных цветов — разные наборы)
          const variantImages = [
            getImage(imageIndex),
            getImage(imageIndex + 1),
            getImage(imageIndex + 2),
            getImage(imageIndex + 3),
          ];
          imageIndex += 1;

          productItemsToCreate.push({
            color: variation.color,
            size: productSize,
            price: variation.priceRub * 100, // в копейках
            isAvailable: variation.isAvailable,
            imageUrls: variantImages,
            sku,
          });

          variantIndex += 1;
        }
      }

      if (productItemsToCreate.length === 0) {
        console.warn(
            `[seedProducts] Для товара "${rawProduct.name}" и состава "${composition}" нет валидных вариаций. Пропускаю.`,
        );
        continue;
      }

      const slug = `product-${String(productIndex).padStart(3, "0")}`;

      // Минимум 4 изображения на товар (обложка + дополнительные)
      const productImages = getImagesForProduct(productIndex);

      productIndex += 1;

      // Генерируем теги для товара
      const tags = generateTags(rawProduct, productIndex);

      await prisma.product.create({
        data: {
          name: rawProduct.name,
          slug,
          categoryId,
          description: rawProduct.description ?? null,
          composition: composition === "—" ? null : composition,
          images: productImages,
          tags,
          items: {
            create: productItemsToCreate,
          },
        },
      });
    }
  }

  console.log(
      `[seedProducts] Закончено. Создано продуктов: ${productIndex - 1}`,
  );
}
