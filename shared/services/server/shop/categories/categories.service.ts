/** Категории: список с in-memory кэшем, маппинг в DTO. */

import { SEVEN_DAYS_MS } from "@/shared/constants";
import { getOrSetAsync, getCategoriesCacheKey } from "@/shared/lib/cache";
import {
  CategoriesRepository,
  type CategorySelectResult,
} from "@/shared/repositories/categories.repository";
import type * as DTO from "@/shared/services/dto";

export class CategoriesService {
  /** Список категорий (кэш 7 дней, single-flight при промахе). */
  static async getAll(): Promise<DTO.CategoriesResponseDto> {
    const { value } = await getOrSetAsync(
      getCategoriesCacheKey(),
      async () => {
        const categories = await CategoriesRepository.findAll();
        return this.mapToResponse(categories);
      },
      SEVEN_DAYS_MS
    );
    return value;
  }

  private static mapToResponse(categories: CategorySelectResult[]): DTO.CategoriesResponseDto {
    const items: DTO.CategoryDto[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));

    return { items };
  }
}
