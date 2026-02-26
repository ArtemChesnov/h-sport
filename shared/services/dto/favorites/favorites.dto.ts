import { ProductListItemDto } from "../product/product-list-item.dto";

// Один элемент избранного.
export type FavoriteDto = {
  productId: number;
  product: ProductListItemDto;
};

// Ответ от GET /api/shop/favorites
export type FavoritesResponseDto = {
  items: FavoriteDto[];
};
