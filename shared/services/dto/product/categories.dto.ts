export type CategoryDto = {
  id: number;
  name: string;
  slug: string; // slug для URL ("tops")
};

// Ответ от API для GET /api/shop/categories
export type CategoriesResponseDto = {
  items: CategoryDto[];
};
