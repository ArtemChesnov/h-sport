/** Категории: список с кэшем (Redis/in-memory), маппинг в DTO. */

import { SEVEN_DAYS_MS } from "@/shared/constants";
import { getAsync, set } from "@/shared/lib/cache";
import {
    CategoriesRepository,
    type CategorySelectResult,
} from "@/shared/repositories/categories.repository";
import { DTO } from "@/shared/services";

const CACHE_KEY = "categories_list";

export class CategoriesService {
  /** Список категорий (кэш 7 дней). */
  static async getAll(): Promise<DTO.CategoriesResponseDto> {
    // Проверяем кеш (Redis приоритет, затем in-memory)
    const cached = await getAsync<DTO.CategoriesResponseDto>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Загружаем из БД через репозиторий
    const categories = await CategoriesRepository.findAll();

    // Маппим в DTO
    const response = this.mapToResponse(categories);

    // Сохраняем в кэш
    set(CACHE_KEY, response, SEVEN_DAYS_MS);

    return response;
  }

  private static mapToResponse(
    categories: CategorySelectResult[],
  ): DTO.CategoriesResponseDto {
    const items: DTO.CategoryDto[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));

    return { items };
  }
}
