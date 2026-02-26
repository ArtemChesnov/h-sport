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
 * - gcTime: 30 дней — долго храним в памяти для мгновенного доступа
 * - placeholderData: сохраняем предыдущие данные при обновлении (React Query v5)
 */
export function useCategoriesQuery() {
  return useQuery<DTO.CategoriesResponseDto>({
    queryKey: ["categories"],
    queryFn: () => CATEGORIES_CLIENT.fetchCategories(),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 дней — категории редко меняются
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 дней для garbage collection
    placeholderData: (previousData) => previousData ?? undefined, // Сохраняем предыдущие данные при обновлении
  });
}
