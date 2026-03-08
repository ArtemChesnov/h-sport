/** Админка: создание товара, список с фильтрами и сортировкой, get/update/delete по slug. */

import fs from "fs";
import path from "path";
import { prisma } from "@/prisma/prisma-client";
import { calculateSkip } from "@/shared/lib/pagination";
import { slugify } from "@/shared/lib/generators";
import { generateProductSku, generateVariantSku } from "@/shared/lib/generators";
import {
  ensureUniqueSlug,
  getProductIdsSortedByPopularity,
  getProductsWithMaxPrice,
  getProductsWithMinPrice,
  mapProductToDetailDto,
} from "@/shared/lib/products";
import { deleteUploadedFiles } from "./upload.service";
import type * as DTO from "@/shared/services/dto";
import type { Prisma } from "@prisma/client";
import type { Size as PrismaSize } from "@prisma/client";

/** Результат создания товара */
export type CreateProductResult =
  | { ok: true; product: DTO.ProductDetailDto }
  | { ok: false; status: number; message: string };

/**
 * Нормализует payload для создания товара
 */
export function normalizeProductPayload(raw: DTO.ProductCreateDto): DTO.ProductCreateDto {
  return {
    ...raw,
    name: raw.name?.trim() ?? "",
    slug: raw.slug?.trim() ? slugify(raw.slug.trim()) : slugify(raw.name ?? ""),
    description: raw.description ?? "",
    composition: raw.composition ?? "",
    tags: raw.tags ?? [],
    images: raw.images ?? [],
    items: raw.items ?? [],
  };
}

/**
 * Создаёт товар с вариантами в транзакции
 */
export async function createProduct(payload: DTO.ProductCreateDto): Promise<CreateProductResult> {
  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Проверяем категорию
      const category = await tx.category.findUnique({
        where: { id: payload.categoryId },
      });

      if (!category) {
        return { ok: false as const, status: 400, message: "Категория не найдена" };
      }

      // Генерируем уникальный slug
      const baseSlug = payload.slug || slugify(payload.name);
      const uniqueSlug = await ensureUniqueSlug(tx, baseSlug);

      // Создаём товар
      // Синхронизируем product.images из imageUrls вариантов
      let resolvedImages = payload.images ?? [];
      if (payload.items.length > 0) {
        const fromItems = payload.items.flatMap((it) => it.imageUrls ?? []);
        const unique = Array.from(new Set(fromItems));
        if (unique.length > 0) resolvedImages = unique;
      }

      const createdProduct = await tx.product.create({
        data: {
          name: payload.name,
          slug: uniqueSlug,
          categoryId: payload.categoryId,
          description: payload.description,
          composition: payload.composition,
          tags: payload.tags,
          images: resolvedImages,
        },
      });

      // Генерируем базовый SKU
      const baseSku =
        payload.sku?.trim() ||
        generateProductSku(createdProduct.id, { categorySlug: category.slug });

      // Создаём варианты товара
      const itemsData = payload.items.map((it, i) => {
        const itemSku =
          it.sku?.trim() || generateVariantSku(baseSku, i, { color: it.color, size: it.size });

        return {
          productId: createdProduct.id,
          sku: itemSku,
          color: it.color,
          size: it.size,
          price: it.price,
          isAvailable: Boolean(it.isAvailable),
          imageUrls: Array.from(new Set(it.imageUrls ?? [])),
        };
      });

      if (itemsData.length > 0) {
        await tx.productItem.createMany({ data: itemsData });
      }

      // Загружаем полные данные товара
      const full = await tx.product.findUnique({
        where: { id: createdProduct.id },
        select: PRODUCT_DETAIL_SELECT,
      });

      if (!full) {
        return { ok: false as const, status: 500, message: "Не удалось прочитать созданный товар" };
      }

      return { ok: true as const, product: full };
    },
    { timeout: 15000 }
  );

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  const dto = mapProductToDetailDto(result.product);
  if (!dto) {
    return {
      ok: false,
      status: 500,
      message: "Не удалось преобразовать товар (нет вариантов или категории)",
    };
  }
  return { ok: true, product: dto };
}

/** Select для полных данных товара */
const PRODUCT_DETAIL_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  composition: true,
  images: true,
  tags: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  items: {
    select: {
      id: true,
      sku: true,
      color: true,
      size: true,
      price: true,
      isAvailable: true,
      imageUrls: true,
    },
  },
} as const;

/** Select для списка товаров в админке */
const ADMIN_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  categoryId: true,
  images: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  items: {
    select: {
      id: true,
      price: true,
      isAvailable: true,
      imageUrls: true,
    },
  },
} as const;

export type AdminProductListItem = Prisma.ProductGetPayload<{ select: typeof ADMIN_LIST_SELECT }>;

/** Параметры фильтрации для списка товаров */
export interface AdminProductsFilters {
  q?: string;
  categorySlug?: string;
  categoryId?: number;
  availability?: "available" | "unavailable";
  sort?: "new" | "price_asc" | "price_desc" | "popular";
  page: number;
  perPage: number;
}

/**
 * Получает список товаров для админки с фильтрацией и сортировкой
 */
export async function getAdminProductsList(
  filters: AdminProductsFilters
): Promise<{ products: AdminProductListItem[]; total: number }> {
  const where = buildProductsWhere(filters);
  const total = await prisma.product.count({ where });

  const { sort, page, perPage } = filters;
  const skip = calculateSkip(page, perPage);

  let products: AdminProductListItem[];

  if (sort === "price_asc" || sort === "price_desc") {
    products = await getProductsSortedByPrice(where, sort, skip, perPage);
  } else if (sort === "popular") {
    products = await getProductsSortedByPopularity(where, skip, perPage);
  } else {
    // "new" — по умолчанию
    products = await prisma.product.findMany({
      where,
      select: ADMIN_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    });
  }

  return { products, total };
}

/**
 * Строит WHERE условие для фильтрации товаров
 */
function buildProductsWhere(filters: AdminProductsFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { slug: { contains: filters.q, mode: "insensitive" } },
      { items: { some: { sku: { contains: filters.q, mode: "insensitive" } } } },
    ];
  }

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  } else if (typeof filters.categoryId === "number") {
    where.categoryId = filters.categoryId;
  }

  if (filters.availability === "available") {
    and.push({ items: { some: { isAvailable: true } } });
  } else if (filters.availability === "unavailable") {
    and.push({ items: { none: { isAvailable: true } } });
  }

  if (and.length) where.AND = and;
  return where;
}

/**
 * Получает товары отсортированные по цене
 */
async function getProductsSortedByPrice(
  where: Prisma.ProductWhereInput,
  sort: "price_asc" | "price_desc",
  skip: number,
  take: number
): Promise<AdminProductListItem[]> {
  const orderBy = sort === "price_asc" ? "asc" : "desc";

  const productsWithPrice =
    sort === "price_asc"
      ? await getProductsWithMinPrice(prisma, where, orderBy, skip, take)
      : await getProductsWithMaxPrice(prisma, where, orderBy, skip, take);

  const productIds = productsWithPrice.map((p) => p.productId);
  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { ...where, id: { in: productIds } },
    select: ADMIN_LIST_SELECT,
  });

  // Сохраняем порядок из SQL
  const orderMap = new Map(productsWithPrice.map((p, i) => [p.productId, i]));
  products.sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity));

  return products;
}

/**
 * Получает товары отсортированные по популярности
 */
async function getProductsSortedByPopularity(
  where: Prisma.ProductWhereInput,
  skip: number,
  take: number
): Promise<AdminProductListItem[]> {
  const productIds = await getProductIdsSortedByPopularity(prisma, where, skip, take);
  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { ...where, id: { in: productIds } },
    select: ADMIN_LIST_SELECT,
  });

  const orderMap = new Map(productIds.map((id, i) => [id, i]));
  products.sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity));

  return products;
}

/**
 * Деталка товара по slug для админки (форма редактирования).
 * Если у товара битая ссылка на категорию (category удалена), подставляем первую существующую категорию.
 */
export async function getAdminProductBySlug(slug: string): Promise<DTO.ProductDetailDto | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: PRODUCT_DETAIL_SELECT,
  });
  if (!product) return null;

  type ProductForMapper = Parameters<typeof mapProductToDetailDto>[0];
  let productForMapper = product as ProductForMapper;

  if (!productForMapper.category) {
    const firstCategory = await prisma.category.findFirst({
      orderBy: { id: "asc" },
      select: { id: true, slug: true, name: true },
    });
    if (!firstCategory) return null;
    productForMapper = {
      ...productForMapper,
      categoryId: firstCategory.id,
      category: firstCategory,
    } as ProductForMapper;
  }

  return mapProductToDetailDto(productForMapper);
}

function extractBaseSkuFromItems(items: { sku: string | null }[]): string | null {
  const withSku = items.find((item) => item.sku && item.sku.trim());
  if (!withSku?.sku) return null;
  const parts = withSku.sku.split("-");
  if (parts.length < 3) return null;
  return parts.slice(0, 3).join("-");
}

/**
 * Результат обновления товара (сырой продукт + варианты для ответа и revalidate).
 */
export type UpdateAdminProductResult = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string | null;
  composition: string | null;
  images: string[];
  tags: string[];
  category: { id: number; name: string; slug: string };
  items: Array<{
    id: number;
    sku: string | null;
    color: string;
    size: string;
    price: number;
    isAvailable: boolean;
    imageUrls: string[];
  }>;
};

/**
 * Обновляет товар по slug (транзакция: продукт + варианты).
 * Если передан basePath (например process.cwd()), после сохранения удаляет с диска
 * файлы фото, которые больше не привязаны к товару.
 */
export async function updateAdminProduct(
  slug: string,
  body: DTO.ProductUpdateDto,
  options?: { basePath?: string }
): Promise<UpdateAdminProductResult | null> {
  const {
    categoryId: incomingCategoryId,
    name,
    slug: newSlug,
    sku: incomingSku,
    description,
    composition,
    images,
    tags,
    items,
  } = body;

  const existingForImages = await prisma.product.findUnique({
    where: { slug },
    select: { images: true, items: { select: { imageUrls: true } } },
  });
  const oldImageUrls = existingForImages
    ? [
        ...(existingForImages.images ?? []),
        ...existingForImages.items.flatMap((i) => i.imageUrls ?? []),
      ]
    : [];

  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.product.findUnique({
        where: { slug },
        select: {
          id: true,
          categoryId: true,
          name: true,
          slug: true,
          description: true,
          composition: true,
          images: true,
          tags: true,
          category: { select: { slug: true } },
          items: { select: { sku: true } },
        },
      });

      if (!existing) return null;

      let nextCategoryId = incomingCategoryId ?? existing.categoryId;
      let categorySlug: string;

      if (existing.category) {
        categorySlug = existing.category.slug;
      } else {
        const firstCategory = await tx.category.findFirst({
          orderBy: { id: "asc" },
          select: { id: true, slug: true },
        });
        if (!firstCategory) throw new Error("В базе нет ни одной категории");
        nextCategoryId = firstCategory.id;
        categorySlug = firstCategory.slug;
      }

      if (incomingCategoryId != null && incomingCategoryId !== existing.categoryId) {
        const newCategory = await tx.category.findUnique({ where: { id: incomingCategoryId } });
        if (!newCategory) {
          nextCategoryId = existing.category ? existing.categoryId : nextCategoryId;
          categorySlug = existing.category ? existing.category.slug : categorySlug;
        } else {
          nextCategoryId = newCategory.id;
          categorySlug = newCategory.slug;
        }
      }

      let baseSku: string;
      if (typeof incomingSku === "string" && incomingSku.trim()) {
        baseSku = incomingSku.trim();
      } else {
        const fromItems = extractBaseSkuFromItems(existing.items);
        baseSku = fromItems ?? generateProductSku(existing.id, { categorySlug });
      }

      // Синхронизируем product.images из imageUrls вариантов:
      // берём уникальные URL из всех вариантов, сохраняя порядок.
      // Это гарантирует, что обложка (images[0]) всегда актуальна.
      let resolvedImages = images ?? existing.images;
      if (items && items.length > 0) {
        const fromItems = items.flatMap((it) => it.imageUrls ?? []);
        const unique = Array.from(new Set(fromItems));
        if (unique.length > 0) {
          resolvedImages = unique;
        }
      }

      const updatedProduct = await tx.product.update({
        where: { id: existing.id },
        data: {
          name: name ?? existing.name,
          slug: newSlug ?? existing.slug,
          categoryId: nextCategoryId,
          description: description !== undefined ? description : existing.description,
          composition: composition !== undefined ? composition : existing.composition,
          images: resolvedImages,
          tags: tags ?? existing.tags,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          categoryId: true,
          description: true,
          composition: true,
          images: true,
          tags: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      if (!items) {
        const existingItems = await tx.productItem.findMany({
          where: { productId: existing.id },
        });
        return { ...updatedProduct, items: existingItems } as UpdateAdminProductResult;
      }

      if (items.length === 0) {
        await tx.productItem.deleteMany({ where: { productId: existing.id } });
        return { ...updatedProduct, items: [] } as UpdateAdminProductResult;
      }

      await tx.productItem.deleteMany({ where: { productId: existing.id } });

      const itemsData = items.map((item, index) => ({
        productId: existing.id,
        sku:
          item.sku?.trim() ||
          generateVariantSku(baseSku, index, { size: item.size, color: item.color }),
        color: item.color,
        size: item.size as PrismaSize,
        price: item.price,
        isAvailable: item.isAvailable ?? true,
        imageUrls: Array.from(new Set(item.imageUrls ?? [])),
      }));

      const createdItems = await Promise.all(
        itemsData.map((data) => tx.productItem.create({ data }))
      );

      return { ...updatedProduct, items: createdItems } as UpdateAdminProductResult;
    },
    { timeout: 15000 }
  );

  if (result && options?.basePath && oldImageUrls.length > 0) {
    const newImageUrls = [
      ...(result.images ?? []),
      ...result.items.flatMap((i) => i.imageUrls ?? []),
    ];
    const orphaned = oldImageUrls.filter((u) => !newImageUrls.includes(u));
    if (orphaned.length > 0) {
      await deleteUploadedFiles(orphaned, options.basePath);
    }
  }
  return result;
}

/**
 * Удаляет товар по slug (и все варианты). При передаче basePath удаляет с диска
 * все фото товара (product.images + items.imageUrls). Возвращает true, если удалён.
 */
export async function deleteAdminProduct(
  slug: string,
  options?: { basePath?: string }
): Promise<boolean> {
  const existingForImages = await prisma.product.findUnique({
    where: { slug },
    select: { images: true, items: { select: { imageUrls: true } } },
  });

  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.product.findUnique({
        where: { slug },
        include: { items: true },
      });
      if (!existing) return null;
      await tx.productItem.deleteMany({ where: { productId: existing.id } });
      await tx.product.delete({ where: { id: existing.id } });
      return existing;
    },
    { timeout: 10000 }
  );

  if (result && options?.basePath) {
    const urls = [
      ...(existingForImages?.images ?? []),
      ...(existingForImages?.items?.flatMap((i) => i.imageUrls ?? []) ?? []),
    ];
    if (urls.length > 0) {
      await deleteUploadedFiles(urls, options.basePath);
    }
  }

  return result != null;
}

const PRODUCTS_IMAGES_DIR = "products";

/**
 * Удаляет из public/assets/images/products файлы, не привязанные ни к одному товару.
 * Вызывается автоматически после PATCH/DELETE товара, можно вызывать вручную.
 */
export async function cleanupOrphanProductImages(basePath: string): Promise<{
  deleted: number;
  errors: number;
}> {
  const products = await prisma.product.findMany({
    select: { images: true, items: { select: { imageUrls: true } } },
  });

  const referenced = new Set<string>();
  for (const p of products) {
    for (const url of p.images ?? []) {
      const n = (url || "").trim();
      if (n && n.includes("assets/images/")) {
        referenced.add(n.startsWith("/") ? n : `/${n}`);
      }
    }
    for (const item of p.items) {
      for (const url of item.imageUrls ?? []) {
        const n = (url || "").trim();
        if (n && n.includes("assets/images/")) {
          referenced.add(n.startsWith("/") ? n : `/${n}`);
        }
      }
    }
  }

  const dir = path.join(basePath, "public", "assets", "images", PRODUCTS_IMAGES_DIR);
  if (!fs.existsSync(dir)) {
    return { deleted: 0, errors: 0 };
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  const orphanedUrls: string[] = [];
  for (const name of files) {
    const url = `/assets/images/products/${name}`;
    if (!referenced.has(url)) orphanedUrls.push(url);
  }

  if (orphanedUrls.length === 0) {
    return { deleted: 0, errors: 0 };
  }

  const { deleted, errors } = await deleteUploadedFiles(orphanedUrls, basePath);
  return { deleted: deleted.length, errors: errors.length };
}
