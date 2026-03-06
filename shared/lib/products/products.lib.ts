/**
 * Утилиты для работы с продуктами
 */

import { createHash } from "crypto";
import type * as DTO from "@/shared/services/dto";
import type { Size as PrismaSize } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { ParsedProductsQuery } from "./validation.lib";

/** Максимальная длина ключа кэша каталога; при превышении используется hash. */
export const MAX_CATALOG_CACHE_KEY_LENGTH = 512;
/** Максимальная длина поисковой строки (q) в ключе (защита от key explosion). */
export const MAX_SEARCH_LENGTH_FOR_CACHE = 200;
/** Префикс версии ключей каталога (при смене — инвалидация старого кэша). */
export const CATALOG_CACHE_VERSION_PREFIX = "catalog:v1|";

/**
 * Продукт с нужными связями:
 *  - Product;
 *  - Category;
 *  - ProductItem[].
 *
 * Использует select для оптимизации - загружаются только нужные поля.
 */
export type ProductWithRelations = Prisma.ProductGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    images: true;
    tags: true;
    categoryId: true;
    category: {
      select: {
        id: true;
        slug: true;
        name: true;
      };
    };
    items: {
      select: {
        id: true;
        price: true;
        color: true;
        size: true;
        sku: true;
        isAvailable: true;
        imageUrls: true;
      };
    };
  };
}>;

// Re-export для обратной совместимости
export type { ParsedProductsQuery } from "./validation.lib";

/**
 * Строит канонический ключ кэша каталога по query (стабильный порядок, лимиты, hash при длинном ключе).
 * Используется для кеширования результатов запросов товаров; защита от key explosion и poisoning.
 */
export function buildCatalogCacheKey(query: ParsedProductsQuery): string {
  const parts: string[] = ["products"];

  parts.push(`page:${query.page}`, `perPage:${query.perPage}`);
  parts.push(`sort:${query.sort || "new"}`);

  if (query.categorySlug && query.categorySlug.length > 0) {
    const sorted = [...query.categorySlug].sort().join(",");
    parts.push(`cat:${sorted}`);
  }
  if (query.color && query.color.length > 0) {
    const sorted = [...query.color]
      .map((c) => c.toLowerCase())
      .sort()
      .join(",");
    parts.push(`color:${sorted}`);
  }
  if (query.size && query.size.length > 0) {
    const sorted = [...query.size].sort().join(",");
    parts.push(`size:${sorted}`);
  }
  if (query.priceFrom !== undefined) parts.push(`priceFrom:${query.priceFrom}`);
  if (query.priceTo !== undefined) parts.push(`priceTo:${query.priceTo}`);
  if (query.sku) parts.push(`sku:${query.sku.toLowerCase().slice(0, 100)}`);

  if (query.q) {
    const q = query.q.toLowerCase().trim();
    const truncated =
      q.length > MAX_SEARCH_LENGTH_FOR_CACHE ? q.slice(0, MAX_SEARCH_LENGTH_FOR_CACHE) : q;
    parts.push(`q:${truncated}`);
  }

  const raw = parts.join("|");
  const prefix = CATALOG_CACHE_VERSION_PREFIX;
  if (raw.length <= MAX_CATALOG_CACHE_KEY_LENGTH) return prefix + raw;
  return prefix + "products:h:" + createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

/**
 * Генерирует ключ кеша на основе query параметров (делегирует в buildCatalogCacheKey).
 */
export function getProductsCacheKey(query: ParsedProductsQuery): string {
  return buildCatalogCacheKey(query);
}

/**
 * Строит Prisma-where для Product по ParsedProductsQuery.
 * Принимает частичный объект, так как page, perPage, sort не используются в where условии.
 */
export function buildProductsWhere(query: Partial<ParsedProductsQuery>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  // Фильтр по категории (поддержка множественных категорий).
  if (query.categorySlug && query.categorySlug.length > 0) {
    if (query.categorySlug.length === 1) {
      where.category = {
        slug: query.categorySlug[0],
      };
    } else {
      where.category = {
        slug: {
          in: query.categorySlug,
        },
      };
    }
  }

  // Фильтры по вариантам (ProductItem).
  const itemFilters: Prisma.ProductItemWhereInput = {};

  if (query.color && query.color.length > 0) {
    // Поддержка множественных цветов (case-insensitive)
    if (query.color.length === 1) {
      itemFilters.color = {
        equals: query.color[0],
        mode: "insensitive",
      };
    } else {
      itemFilters.color = {
        in: query.color,
        mode: "insensitive",
      };
    }
  }

  if (query.size && query.size.length > 0) {
    if (query.size.length === 1) {
      itemFilters.size = query.size[0] as PrismaSize;
    } else {
      itemFilters.size = {
        in: query.size as PrismaSize[],
      };
    }
  }

  if (query.priceFrom !== undefined || query.priceTo !== undefined) {
    itemFilters.price = {};

    if (query.priceFrom !== undefined) {
      itemFilters.price.gte = query.priceFrom;
    }

    if (query.priceTo !== undefined) {
      itemFilters.price.lte = query.priceTo;
    }
  }

  // Точный фильтр по SKU варианта.
  if (query.sku) {
    itemFilters.sku = {
      contains: query.sku,
      mode: "insensitive",
    };
  }

  // Если есть фильтры по вариантам — учитываем items.some(...).
  if (Object.keys(itemFilters).length > 0) {
    where.items = {
      some: itemFilters,
    };
  }

  // Общий поиск q: по name, slug и SKU вариантов.
  if (query.q) {
    const q = query.q;

    where.AND = [
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          {
            items: {
              some: {
                sku: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
    ];
  }

  return where;
}

/**
 * Преобразует продукты из Prisma в DTO для отображения в каталоге.
 *
 * @param products - Массив продуктов с включенными связями (category, items)
 * @returns Массив DTO объектов для отображения в списке каталога
 *
 * @description
 * Выполняет маппинг продуктов из формата Prisma в формат DTO для каталога.
 * Обрабатывает варианты товаров (цвета, размеры), определяет минимальную цену,
 * выбирает превью изображение и формирует список доступных цветов и размеров.
 * Товары без вариантов пропускаются.
 */
export function mapProductsToListDto(products: ProductWithRelations[]): DTO.ProductListItemDto[] {
  return products
    .map<DTO.ProductListItemDto | null>((product) => {
      const productItems = product.items;

      if (productItems.length === 0) {
        // Товар без вариантов — пропускаем.
        return null;
      }

      // Базовый набор вариантов: доступные, иначе все.
      const availableItems = productItems.filter((item) => item.isAvailable);
      const baseItems = availableItems.length > 0 ? availableItems : productItems;

      // --- sku для карточки (берём из первого адекватного варианта) ---
      const itemWithSku = baseItems.find((item) => !!item.sku) ?? baseItems[0];
      const sku = itemWithSku?.sku ?? "";

      // Цена для карточки (берём минимальную среди baseItems).
      const prices = baseItems.map((item) => item.price);
      const price = Math.min(...prices);

      // Цвета и размеры.
      const colors = Array.from(new Set(baseItems.map((item) => item.color)));
      const sizes = Array.from(new Set(baseItems.map((item) => item.size))) as DTO.SizeDto[];

      // Превью-картинка:
      //  - сначала product.images[0];
      //  - если нет — первая картинка из вариантов.
      let previewImage: string | null = null;

      if (product.images && product.images.length > 0 && product.images[0]) {
        previewImage = product.images[0];
      } else {
        const variantWithImages = baseItems.find((item) => item.imageUrls.length > 0);
        previewImage = variantWithImages?.imageUrls[0] ?? null;
      }

      // Комплект (топ + леггинсы)?
      const isSet = product.category.slug === "top-leggings-sets";

      const dtoProduct: DTO.ProductListItemDto = {
        id: product.id,
        slug: product.slug,
        sku,
        name: product.name,

        categoryId: product.categoryId,
        categorySlug: product.category.slug,
        categoryName: product.category.name,

        isSet,
        price,
        previewImage,
        colors,
        sizes,
        tags: product.tags ?? [],
      };

      return dtoProduct;
    })
    .filter((product): product is DTO.ProductListItemDto => product !== null);
}

/**
 * Сортирует товары в памяти по параметру sort.
 */
export function sortProducts(
  products: DTO.ProductListItemDto[],
  sort: DTO.ProductsQueryDto["sort"],
  popularityMap?: Record<number, number>
): DTO.ProductListItemDto[] {
  if (sort === "price_asc") {
    return [...products].sort((a, b) => a.price - b.price);
  }

  if (sort === "price_desc") {
    return [...products].sort((a, b) => b.price - a.price);
  }

  if (sort === "popular") {
    if (!popularityMap) {
      return products;
    }

    return [...products]
      .map((product) => ({
        product,
        popularity: popularityMap[product.id] ?? 0,
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .map((item) => item.product);
  }

  // "new" — по умолчанию уже отсортировано в запросе к БД (createdAt desc).
  return products;
}

/**
 * Пагинация списка товаров в памяти.
 */
export function paginateProducts(
  products: DTO.ProductListItemDto[],
  page: number,
  perPage: number
): { items: DTO.ProductListItemDto[]; meta: DTO.PaginationMetaDto } {
  const total = products.length;
  const pages = Math.max(Math.ceil(total / perPage), 1);

  const safePage = Math.min(page, pages);

  const startIndex = (safePage - 1) * perPage;
  const endIndex = startIndex + perPage;

  const items = products.slice(startIndex, endIndex);

  return {
    items,
    meta: {
      page: safePage,
      perPage,
      total,
      pages,
    },
  };
}

/**
 * Вспомогательная функция для построения SQL условий из Prisma where.
 * Преобразует структуру Prisma.ProductWhereInput в SQL части запроса.
 */
function buildSqlParts(where: Prisma.ProductWhereInput): {
  needsCategoryJoin: boolean;
  whereConditions: Prisma.Sql[];
} {
  const whereConditions: Prisma.Sql[] = [];
  let needsCategoryJoin = false;

  // Фильтр по categoryId (прямое поле)
  if (where.categoryId !== undefined && typeof where.categoryId === "number") {
    whereConditions.push(Prisma.sql`p."categoryId" = ${where.categoryId}`);
  }

  // Фильтр по категории (slug)
  if (where.category && typeof where.category === "object" && "slug" in where.category) {
    const categorySlug = where.category.slug;
    needsCategoryJoin = true;

    if (typeof categorySlug === "string") {
      // Одна категория
      whereConditions.push(Prisma.sql`c.slug = ${categorySlug}`);
    } else if (
      categorySlug &&
      typeof categorySlug === "object" &&
      "in" in categorySlug &&
      Array.isArray(categorySlug.in) &&
      categorySlug.in.length > 0
    ) {
      // Множественные категории - используем ANY с массивом с явным кастом
      whereConditions.push(Prisma.sql`c.slug = ANY(${categorySlug.in}::text[])`);
    }
  }

  // Фильтры по ProductItem (items.some)
  if (where.items && typeof where.items === "object" && "some" in where.items) {
    const itemFilters = where.items.some;

    if (itemFilters && typeof itemFilters === "object") {
      // Фильтр по цвету
      if (itemFilters.color && typeof itemFilters.color === "object") {
        if ("equals" in itemFilters.color && typeof itemFilters.color.equals === "string") {
          whereConditions.push(Prisma.sql`LOWER(pi.color) = LOWER(${itemFilters.color.equals})`);
        } else if (
          "in" in itemFilters.color &&
          Array.isArray(itemFilters.color.in) &&
          itemFilters.color.in.length > 0
        ) {
          // Используем ANY с массивом для case-insensitive сравнения с явным кастом
          const lowerColors = itemFilters.color.in.map((c) => c.toLowerCase());
          whereConditions.push(Prisma.sql`LOWER(pi.color) = ANY(${lowerColors}::text[])`);
        }
      }

      // Фильтр по размеру
      if (itemFilters.size) {
        if (typeof itemFilters.size === "string") {
          whereConditions.push(Prisma.sql`pi.size = ${itemFilters.size}::"Size"`);
        } else if (
          typeof itemFilters.size === "object" &&
          "in" in itemFilters.size &&
          Array.isArray(itemFilters.size.in) &&
          itemFilters.size.in.length > 0
        ) {
          // Используем ANY с массивом enum значений с явным кастом
          const sizes = itemFilters.size.in;
          whereConditions.push(Prisma.sql`pi.size = ANY(${sizes}::"Size"[])`);
        }
      }

      // Фильтр по цене
      if (itemFilters.price && typeof itemFilters.price === "object") {
        if ("gte" in itemFilters.price && typeof itemFilters.price.gte === "number") {
          whereConditions.push(Prisma.sql`pi.price >= ${itemFilters.price.gte}`);
        }
        if ("lte" in itemFilters.price && typeof itemFilters.price.lte === "number") {
          whereConditions.push(Prisma.sql`pi.price <= ${itemFilters.price.lte}`);
        }
      }

      // Фильтр по SKU
      if (
        itemFilters.sku &&
        typeof itemFilters.sku === "object" &&
        "contains" in itemFilters.sku &&
        typeof itemFilters.sku.contains === "string"
      ) {
        const searchPattern = `%${itemFilters.sku.contains}%`;
        whereConditions.push(Prisma.sql`LOWER(pi.sku) LIKE LOWER(${searchPattern})`);
      }
    }
  }

  // Обработка AND условий (для availability и других)
  if (where.AND && Array.isArray(where.AND)) {
    for (const andCondition of where.AND) {
      if (!andCondition || typeof andCondition !== "object") {
        continue;
      }

      // Обработка OR условий (для поиска q)
      if ("OR" in andCondition && Array.isArray(andCondition.OR)) {
        const orConditions: Prisma.Sql[] = [];

        for (const orCondition of andCondition.OR) {
          if (orCondition && typeof orCondition === "object") {
            // Поиск по name
            if (
              "name" in orCondition &&
              orCondition.name &&
              typeof orCondition.name === "object" &&
              "contains" in orCondition.name &&
              typeof orCondition.name.contains === "string"
            ) {
              const searchPattern = `%${orCondition.name.contains}%`;
              orConditions.push(Prisma.sql`LOWER(p.name) LIKE LOWER(${searchPattern})`);
            }

            // Поиск по slug
            if (
              "slug" in orCondition &&
              orCondition.slug &&
              typeof orCondition.slug === "object" &&
              "contains" in orCondition.slug &&
              typeof orCondition.slug.contains === "string"
            ) {
              const searchPattern = `%${orCondition.slug.contains}%`;
              orConditions.push(Prisma.sql`LOWER(p.slug) LIKE LOWER(${searchPattern})`);
            }

            // Поиск по SKU через items
            if (
              "items" in orCondition &&
              orCondition.items &&
              typeof orCondition.items === "object" &&
              "some" in orCondition.items
            ) {
              const itemsSome = orCondition.items.some;
              if (itemsSome && typeof itemsSome === "object" && "sku" in itemsSome) {
                const skuFilter = itemsSome.sku;
                if (
                  skuFilter &&
                  typeof skuFilter === "object" &&
                  "contains" in skuFilter &&
                  typeof skuFilter.contains === "string"
                ) {
                  const searchPattern = `%${skuFilter.contains}%`;
                  orConditions.push(Prisma.sql`LOWER(pi.sku) LIKE LOWER(${searchPattern})`);
                }
              }
            }
          }
        }

        if (orConditions.length > 0) {
          // Объединяем OR условия
          let orSql = orConditions[0];
          for (let i = 1; i < orConditions.length; i++) {
            orSql = Prisma.sql`${orSql} OR ${orConditions[i]}`;
          }
          whereConditions.push(Prisma.sql`(${orSql})`);
        }
      }

      // Обработка availability через items.some/none
      if ("items" in andCondition && andCondition.items && typeof andCondition.items === "object") {
        if (
          "some" in andCondition.items &&
          andCondition.items.some &&
          typeof andCondition.items.some === "object"
        ) {
          const itemsSome = andCondition.items.some;
          if ("isAvailable" in itemsSome && itemsSome.isAvailable === true) {
            // Товары с доступными вариантами
            whereConditions.push(
              Prisma.sql`EXISTS (SELECT 1 FROM "ProductItem" pi_avail WHERE pi_avail."productId" = p.id AND pi_avail."isAvailable" = true)`
            );
          }
        }
        if (
          "none" in andCondition.items &&
          andCondition.items.none &&
          typeof andCondition.items.none === "object"
        ) {
          const itemsNone = andCondition.items.none;
          if ("isAvailable" in itemsNone && itemsNone.isAvailable === true) {
            // Товары без доступных вариантов
            whereConditions.push(
              Prisma.sql`NOT EXISTS (SELECT 1 FROM "ProductItem" pi_avail WHERE pi_avail."productId" = p.id AND pi_avail."isAvailable" = true)`
            );
          }
        }
      }
    }
  }

  // Обработка OR условий на верхнем уровне (для поиска q без AND)
  if (where.OR && Array.isArray(where.OR)) {
    const orConditions: Prisma.Sql[] = [];

    for (const orCondition of where.OR) {
      if (orCondition && typeof orCondition === "object") {
        // Поиск по name
        if (
          "name" in orCondition &&
          orCondition.name &&
          typeof orCondition.name === "object" &&
          "contains" in orCondition.name &&
          typeof orCondition.name.contains === "string"
        ) {
          const searchPattern = `%${orCondition.name.contains}%`;
          orConditions.push(Prisma.sql`LOWER(p.name) LIKE LOWER(${searchPattern})`);
        }

        // Поиск по slug
        if (
          "slug" in orCondition &&
          orCondition.slug &&
          typeof orCondition.slug === "object" &&
          "contains" in orCondition.slug &&
          typeof orCondition.slug.contains === "string"
        ) {
          const searchPattern = `%${orCondition.slug.contains}%`;
          orConditions.push(Prisma.sql`LOWER(p.slug) LIKE LOWER(${searchPattern})`);
        }

        // Поиск по SKU через items
        if (
          "items" in orCondition &&
          orCondition.items &&
          typeof orCondition.items === "object" &&
          "some" in orCondition.items
        ) {
          const itemsSome = orCondition.items.some;
          if (itemsSome && typeof itemsSome === "object" && "sku" in itemsSome) {
            const skuFilter = itemsSome.sku;
            if (
              skuFilter &&
              typeof skuFilter === "object" &&
              "contains" in skuFilter &&
              typeof skuFilter.contains === "string"
            ) {
              const searchPattern = `%${skuFilter.contains}%`;
              orConditions.push(Prisma.sql`LOWER(pi.sku) LIKE LOWER(${searchPattern})`);
            }
          }
        }
      }
    }

    if (orConditions.length > 0) {
      let orSql = orConditions[0];
      for (let i = 1; i < orConditions.length; i++) {
        orSql = Prisma.sql`${orSql} OR ${orConditions[i]}`;
      }
      whereConditions.push(Prisma.sql`(${orSql})`);
    }
  }

  return { needsCategoryJoin, whereConditions };
}

/**
 * Получает минимальную цену товара через агрегацию на уровне БД.
 * Используется для сортировки по цене без загрузки всех товаров в память.
 *
 * Оптимизация: использует ОДИН SQL-запрос с GROUP BY и MIN() для вычисления минимальной цены
 * на уровне БД, применяя все фильтры напрямую в SQL, что позволяет избежать двойного запроса
 * и загрузки всех ID товаров в память.
 */
export async function getProductsWithMinPrice(
  prisma: Prisma.TransactionClient | import("@prisma/client").PrismaClient,
  where: Prisma.ProductWhereInput,
  orderBy: "asc" | "desc",
  skip: number,
  take: number
): Promise<Array<{ productId: number; minPrice: number }>> {
  // Строим SQL части из Prisma where
  const { needsCategoryJoin, whereConditions } = buildSqlParts(where);

  // Строим JOIN части
  const categoryJoin = needsCategoryJoin
    ? Prisma.sql`LEFT JOIN "Category" c ON p."categoryId" = c.id`
    : Prisma.empty;

  // Строим WHERE часть - объединяем все условия через AND
  let whereClause: Prisma.Sql = Prisma.empty;
  if (whereConditions.length > 0) {
    let whereSql = whereConditions[0];
    for (let i = 1; i < whereConditions.length; i++) {
      whereSql = Prisma.sql`${whereSql} AND ${whereConditions[i]}`;
    }
    whereClause = Prisma.sql`WHERE ${whereSql}`;
  }

  // Строим ORDER BY часть
  const orderByClause = orderBy === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  // Строим финальный SQL запрос - ОДИН запрос вместо двух
  const query = Prisma.sql`
    SELECT
      p.id as "productId",
      COALESCE(
        MIN(CASE WHEN pi."isAvailable" = true THEN pi.price ELSE NULL END),
        MIN(pi.price)
      ) as "minPrice"
    FROM "Product" p
    INNER JOIN "ProductItem" pi ON p.id = pi."productId"
    ${categoryJoin}
    ${whereClause}
    GROUP BY p.id
    HAVING MIN(pi.price) IS NOT NULL
    ORDER BY "minPrice" ${orderByClause}
    LIMIT ${take} OFFSET ${skip}
  `;

  const productsWithPrice = await prisma.$queryRaw<
    Array<{
      productId: number;
      minPrice: bigint;
    }>
  >(query);

  return productsWithPrice.map((p) => ({
    productId: p.productId,
    minPrice: Number(p.minPrice),
  }));
}

/**
 * Получает максимальную цену товара через агрегацию на уровне БД.
 * Используется для сортировки по максимальной цене без загрузки всех товаров в память.
 *
 * Оптимизация: использует ОДИН SQL-запрос с GROUP BY и MAX() для вычисления максимальной цены
 * на уровне БД, применяя все фильтры напрямую в SQL.
 */
export async function getProductsWithMaxPrice(
  prisma: Prisma.TransactionClient | import("@prisma/client").PrismaClient,
  where: Prisma.ProductWhereInput,
  orderBy: "asc" | "desc",
  skip: number,
  take: number
): Promise<Array<{ productId: number; maxPrice: number }>> {
  // Строим SQL части из Prisma where
  const { needsCategoryJoin, whereConditions } = buildSqlParts(where);

  // Строим JOIN части
  const categoryJoin = needsCategoryJoin
    ? Prisma.sql`LEFT JOIN "Category" c ON p."categoryId" = c.id`
    : Prisma.empty;

  // Строим WHERE часть - объединяем все условия через AND
  let whereClause: Prisma.Sql = Prisma.empty;
  if (whereConditions.length > 0) {
    let whereSql = whereConditions[0];
    for (let i = 1; i < whereConditions.length; i++) {
      whereSql = Prisma.sql`${whereSql} AND ${whereConditions[i]}`;
    }
    whereClause = Prisma.sql`WHERE ${whereSql}`;
  }

  // Строим ORDER BY часть
  const orderByClause = orderBy === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;

  // Строим финальный SQL запрос - ОДИН запрос вместо двух
  const query = Prisma.sql`
    SELECT
      p.id as "productId",
      COALESCE(
        MAX(CASE WHEN pi."isAvailable" = true THEN pi.price ELSE NULL END),
        MAX(pi.price)
      ) as "maxPrice"
    FROM "Product" p
    INNER JOIN "ProductItem" pi ON p.id = pi."productId"
    ${categoryJoin}
    ${whereClause}
    GROUP BY p.id
    HAVING MAX(pi.price) IS NOT NULL
    ORDER BY "maxPrice" ${orderByClause}
    LIMIT ${take} OFFSET ${skip}
  `;

  const productsWithPrice = await prisma.$queryRaw<
    Array<{
      productId: number;
      maxPrice: bigint;
    }>
  >(query);

  return productsWithPrice.map((p) => ({
    productId: p.productId,
    maxPrice: Number(p.maxPrice),
  }));
}
