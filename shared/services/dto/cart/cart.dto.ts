import { SizeDto } from "../base.dto";

/**
 * Короткая информация о товаре внутри корзины.
 */
export type CartItemProductInfoDto = {
  // id товара (Product.id)
  productId: number;

  // slug товара (Product.slug)
  productSlug: string;

  // название товара (Product.name)
  productName: string;

  /** URL изображения варианта (первое из productItem.imageUrls или product.images) для отображения в корзине/чекауте */
  imageUrl?: string | null;

  // На будущее можно (или сразу) расширить:
  // categorySlug?: string;
  // categoryName?: string | null;
  // isSet?: boolean;          // это комплект "топ+леггинсы"
};

/**
 * Одна позиция корзины.
 */
export type CartItemDto = {
  // id позиции корзины (CartItem.id)
  id: number;

  // id варианта товара (ProductItem.id)
  productItemId: number;

  // Краткая инфа о товаре (для UI)
  product: CartItemProductInfoDto;

  // Параметры варианта для вывода
  color: string;
  size: SizeDto;

  // Количество в корзине
  qty: number;

  // Цена за единицу (в копейках) на момент добавления
  price: number;

  // Сумма по позиции (qty * price, в копейках)
  total: number;
};

/**
 * Корзина целиком.
 *
 * Все денежные значения в копейках.
 */
export type CartDto = {
  /**
   * Токен корзины (для гостей) или
   * любой другой стабильный идентификатор, который я верну с бэка.
   */
  token: string;

  // всего штук в корзине (сумма qty по всем позициям)
  totalItems: number;

  // сумма товаров без учёта скидок/доставки
  subtotal: number;

  // размер скидки (если нет — 0)
  discount: number;

  // итоговая сумма (subtotal - discount)
  total: number;

  /**
   * Применённый промокод (если есть).
   * Например: "WELCOME10" или null.
   */
  promoCode?: string | null;

  // позиции корзины
  items: CartItemDto[];
};

/**
 * DTO для добавления позиции в корзину.
 */
export type CartAddItemDto = {
  // id варианта товара (ProductItem.id)
  productItemId: number;

  /**
   * Количество.
   */
  qty: number;
};

/**
 * DTO для обновления позиции корзины (количества).
 */
export type CartUpdateItemDto = {
  // новое количество (qty > 0; 0 можно трактовать как удаление)
  qty: number;
};
