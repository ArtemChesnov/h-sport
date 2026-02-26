// Товар в списке (каталог, категория).

import { PaginationMetaDto, SizeDto } from "../base.dto";

// Тут не нужны все поля, только то, что надо для карточки.
export type ProductListItemDto = {
  id: number;
  slug: string;
  sku: string;
  name: string; // название товара

  categoryId: number;
  categorySlug: string; // по нему определяем, комплект это или нет
  categoryName: string;

  // Комплект ли это.
  isSet: boolean;

  price: number;

  // Главная картинка товара (обложка).
  previewImage: string | null;

  // Для фильтров/бейджей на карточке.
  colors: string[]; // все доступные цвета товара
  sizes: SizeDto[]; // все доступные размеры товара

  tags: string[]; // любые текстовые теги (новинка, хит, коллекция и т.п.)
};

// Ответ для GET /api/shop/products
export type ProductsListResponseDto = {
  items: ProductListItemDto[]; // сами товары
  meta: PaginationMetaDto; // инфа по пагинации
};
