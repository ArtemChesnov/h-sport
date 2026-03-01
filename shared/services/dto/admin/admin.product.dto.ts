import type { NestedFormErrors } from "@/shared/lib/validation";
import { PaginationMetaDto, SizeDto } from "../base.dto";

/**
 * Входной формат для варианта товара (ProductItem)
 * при создании/редактировании товара.
 */
export type ProductItemInputDto = {
  sku?: string; // артикул варианта (опционально)
  color: string; // цвет варианта
  size: SizeDto; // размер
  price: number; // цена в копейках
  isAvailable?: boolean; // по умолчанию true
  imageUrls?: string[]; // картинки для этого варианта
};

/**
 * Тело запроса на создание товара из админки.
 *
 * POST /api/(admin)/products
 */
export type ProductCreateDto = {
  categoryId: number;

  name: string;

  /**
   * Базовый SKU товара (опционально).
   * Если не передаём, бэк сам генерирует:
   *  - baseSku для товара;
   *  - variantSku для каждого варианта.
   */
  sku?: string;

  /**
   * Slug (опционально).
   * Если не передаём, бэк:
   *  - генерирует из name (транслитерация + нормализация);
   *  - проверяет на уникальность и при коллизии добавляет "-2", "-3", ...
   */
  slug?: string;

  description?: string | null;
  composition?: string | null;

  images?: string[];
  tags?: string[];

  items: ProductItemInputDto[];
};

/**
 * Тело запроса на обновление товара из админки.
 *
 * PATCH /api/(admin)/products/:slug
 *
 * Все поля опциональны, обновляются только переданные.
 */
export type ProductUpdateDto = {
  categoryId?: number;

  name?: string;

  /**
   * Базовый SKU товара (опционально).
   * Если передать — можно «переименовать» базовый SKU,
   * при этом variant SKU будут перегенерированы на бэке,
   * если не заданы явно в items[].sku.
   */
  sku?: string;

  /**
   * Новый slug (опционально).
   * Если не передавать — останется старый.
   */
  slug?: string;

  description?: string | null;
  composition?: string | null;

  images?: string[];
  tags?: string[];

  items?: ProductItemInputDto[];
};

/**
 * Один товар в списке (админка).
 *
 * Используется на /(admin)/products в таблице.
 */
export type AdminProductListItemDto = {
  id: number;
  slug: string;
  name: string;
  sku: string;

  categoryId: number;
  categoryName: string;

  /**
   * Есть ли вообще варианты у товара.
   * Нужно, чтобы не терять «пустые» товары в админке.
   */
  hasItems: boolean;
  itemsCount: number;

  /**
   * Есть ли хоть один доступный (isAvailable) вариант.
   */
  isAvailableOverall: boolean;

  /**
   * Минимальная и максимальная цена по вариантам (в копейках).
   * Если вариантов нет — null.
   */
  priceMin: number | null;
  priceMax: number | null;

  /**
   * Превью-изображение товара для отображения в таблице.
   * Приоритет: product.images[0] > первый вариант с изображением.
   */
  previewImage: string | null;

  createdAt: string; // ISO-строка
};

/**
 * Ответ для GET /api/(admin)/products.
 */
export type AdminProductsListResponseDto = {
  items: AdminProductListItemDto[];
  meta: PaginationMetaDto;
};

/** Строка варианта в форме редактирования товара (админка) */
export type VariantFormRow = {
  id: string;
  color: string;
  size: SizeDto;
  sku: string;
  priceRub: string;
  isAvailable: boolean;
  imageUrls: string[];
};

/** Значения формы товара в админке (создание/редактирование) */
export type AdminProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  categoryId: number;
  description: string;
  composition: string;
  tags: string[];
  images: string[];
  variants: VariantFormRow[];
};

/** Пропсы формы товара в админке */
export type AdminProductFormProps = {
  mode: "create" | "edit";
  initialValues: AdminProductFormValues;
  /** Имя категории товара (для отображения в селекте до загрузки списка категорий) */
  initialCategoryName?: string;
  isSubmitting?: boolean;
  onSubmit: (values: AdminProductFormValues) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  errorsTree?: NestedFormErrors;
};
