import { Prisma, PrismaClient, Size } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { generateSku } from "../shared/lib/generators";
import { RAW_PRODUCTS } from "./constants";
import { RawProduct } from "./types";

/**
 * Строит карту SKU (lowercase) → отсортированный список URL изображений.
 * Файлы в public/assets/images/products/ имеют формат:
 *   {name}_{color}_{sku}-{photoNum}-{hash}.webp
 */
function buildSkuImageMap(): Map<string, string[]> {
  const imagesDir = path.join(process.cwd(), "public/assets/images/products");
  const map = new Map<string, string[]>();

  if (!fs.existsSync(imagesDir)) return map;

  const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith(".webp"));

  for (const file of files) {
    // Извлекаем SKU: всё между вторым "_" и последними двумя "-{num}-{hash}.webp"
    // Пример: top_chernyy_hs-top-0020-m-clr-01-4-b2c271ef.webp → hs-top-0020-m-clr-01
    const match = file.match(/_([a-z]+-[a-z]+-\d+-[a-z]+-[a-z]+-\d+)-\d+-[0-9a-f]+\.webp$/i);
    if (!match) continue;

    const sku = match[1].toLowerCase();
    const url = `/assets/images/products/${file}`;

    if (!map.has(sku)) map.set(sku, []);
    map.get(sku)!.push(url);
  }

  // Сортируем по номеру фото (предпоследний сегмент перед хешем)
  for (const [, urls] of map) {
    urls.sort((a, b) => {
      const numA = parseInt(a.match(/-(\d+)-[0-9a-f]+\.webp$/)?.[1] ?? "0");
      const numB = parseInt(b.match(/-(\d+)-[0-9a-f]+\.webp$/)?.[1] ?? "0");
      return numA - numB;
    });
  }

  return map;
}

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
 * Сидинг товаров из данных клиента (products_with_id.json).
 * - ID товаров берутся из файла (Product.id = id из JSON).
 * - Создаём продукты и варианты (items), генерируем SKU.
 * - Размеры: пустой sizes → ONE_SIZE.
 * - Фото не подставляем: images и imageUrls — пустые массивы (добавление вручную в админке).
 * - Состав: при отсутствии в данных не пишем (null).
 */
export async function seedProducts(prisma: PrismaClient) {
  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map<string, number>(categories.map((c) => [c.slug, c.id]));
  const skuImageMap = buildSkuImageMap();

  console.log(`[seedProducts] Найдено ${skuImageMap.size} уникальных SKU с фотографиями`);

  const allProducts: RawProduct[] = [...RAW_PRODUCTS];

  let productIndex = 1;

  for (const rawProduct of allProducts) {
    const categoryId = categoryIdBySlug.get(rawProduct.categorySlug);

    if (!categoryId) {
      console.warn(
        `[seedProducts] Категория с slug="${rawProduct.categorySlug}" не найдена. ` +
          `Товар "${rawProduct.name}" пропущен.`
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
        `[seedProducts] Для товара "${rawProduct.name}" нет ни одной вариации. Пропускаю.`
      );
      continue;
    }

    let firstInRaw = true;

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
          variation.sizes && variation.sizes.length > 0 ? variation.sizes : [Size.ONE_SIZE];

        for (const productSize of sizesToUse) {
          const key = `${variation.color}__${productSize}`;

          if (usedColorSizeKeys.has(key)) {
            console.warn(
              `[seedProducts] Дубликат варианта color="${variation.color}", size="${productSize}" ` +
                `в товаре "${rawProduct.name}" (composition="${composition}"). Пропускаю дубликат.`
            );
            continue;
          }

          usedColorSizeKeys.add(key);

          const sku = generateSku(productIndex, variantIndex, {
            categorySlug: rawProduct.categorySlug,
            color: variation.color,
            size: productSize,
          });

          const itemImages = skuImageMap.get(sku.toLowerCase()) ?? [];

          productItemsToCreate.push({
            color: variation.color,
            size: productSize,
            price: variation.priceRub * 100, // в копейках
            isAvailable: variation.isAvailable,
            imageUrls: itemImages,
            sku,
          });

          variantIndex += 1;
        }
      }

      if (productItemsToCreate.length === 0) {
        console.warn(
          `[seedProducts] Для товара "${rawProduct.name}" и состава "${composition}" нет валидных вариаций. Пропускаю.`
        );
        continue;
      }

      // ID из файла — только для первого продукта по этому rawProduct (в JSON один id на строку)
      const productId = firstInRaw && rawProduct.id != null ? rawProduct.id : undefined;
      firstInRaw = false;

      const slug =
        productId != null
          ? `product-${String(productId).padStart(3, "0")}`
          : `product-${String(productIndex).padStart(3, "0")}`;

      productIndex += 1;

      // Генерируем теги для товара
      const tags = generateTags(rawProduct, productIndex);

      const firstItemImages = productItemsToCreate[0]?.imageUrls ?? [];

      await prisma.product.create({
        data: {
          ...(productId != null ? { id: productId } : {}),
          name: rawProduct.name,
          slug,
          categoryId,
          description: rawProduct.description ?? null,
          composition: composition === "—" ? null : composition,
          images: firstItemImages.length > 0 ? firstItemImages : [],
          tags,
          items: {
            create: productItemsToCreate,
          },
        },
      });
    }
  }

  // Сбрасываем sequence для Product.id, чтобы следующий автоинкремент был корректен
  try {
    await prisma.$executeRaw(
      Prisma.sql`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), COALESCE((SELECT MAX(id) FROM "Product"), 1))`
    );
  } catch {
    // SQLite или другая БД — игнорируем
  }

  console.log(`[seedProducts] Закончено. Создано продуктов: ${productIndex - 1}`);
}
