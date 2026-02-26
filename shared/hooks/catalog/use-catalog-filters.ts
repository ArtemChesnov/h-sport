/**
 * Хук для получения фильтров каталога (цвета, размеры и диапазон цен)
 */

import { useQuery } from "@tanstack/react-query";
import type { Size } from "@prisma/client";

interface CatalogFiltersData {
  colors: string[];
  sizes: Size[];
  priceRange: {
    min: number;
    max: number;
  };
}

async function fetchCatalogFilters(): Promise<CatalogFiltersData> {
  const response = await fetch("/api/shop/filters");
  if (!response.ok) {
    throw new Error("Failed to fetch catalog filters");
  }
  return response.json();
}

export function useCatalogFiltersQuery() {
  return useQuery({
    queryKey: ["catalog-filters"],
    queryFn: fetchCatalogFilters,
    staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут
  });
}
