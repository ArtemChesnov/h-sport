"use client";

import { useQuery } from "@tanstack/react-query";
import { CATEGORIES_CLIENT, DTO } from "@/shared/services";

/**
 * Хук для загрузки списка категорий каталога.
 *
 * Пример:
 *   const { data, isLoading } = useCategoriesQuery();
 *   const categories = data?.items ?? [];
 *
 * Кеширование:
 * - staleTime: 7 дней — категории редко меняются (~1 раз в месяц/полгода)
 * - gcTime: 24 дня — долго храним в памяти (ограничено 2^31-1 мс в Node setTimeout)
 * - placeholderData: сохраняем предыдущие данные при обновлении (React Query v5)
 */
export function useCategoriesQuery() {
  return useQuery<DTO.CategoriesResponseDto>({
    queryKey: ["categories"],
    queryFn: () => CATEGORIES_CLIENT.fetchCategories(),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней — категории редко меняются
    gcTime: 24 * 24 * 60 * 60 * 1000, // 24 дня (макс. без TimeoutOverflow в Node)
    placeholderData: (previousData) => previousData ?? undefined, // Сохраняем предыдущие данные при обновлении
  });
}
