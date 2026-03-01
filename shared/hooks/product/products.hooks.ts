"use client";

import { DTO, PRODUCT_CLIENT, PRODUCT_ITEM_CLIENT } from "@/shared/services";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

/**
 * Хук для получения списка товаров (каталог витрины).
 *
 * SSR-safe: при передаче initialData запрос не выполняется на сервере (данные уже есть).
 * Без initialData запрос выполняется на клиенте.
 */
export function useProductsQuery(
  params: DTO.ProductsQueryDto = {},
  options?: {
    initialData?: DTO.ProductsListResponseDto;
    enabled?: boolean;
  }
): UseQueryResult<DTO.ProductsListResponseDto, Error> {
  const stableKey = ["products", JSON.stringify(params)] as const;

  return useQuery({
    queryKey: stableKey,
    queryFn: () => PRODUCT_CLIENT.fetchProducts(params),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled ?? true,
    ...(options?.initialData && {
      initialData: options.initialData,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60_000,
    }),
  });
}

/**
 * Хук для получения данных конкретного товара по slug.
 *
 * Используется на странице товара /product/[slug].
 *
 * @param slug - Slug товара
 * @param options - Опции хука, включая initialData для SSR
 */
export function useProductQuery(
  slug: string | null | undefined,
  options?: {
    initialData?: DTO.ProductDetailDto;
  }
) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => {
      if (!slug) {
        throw new Error("Slug товара не передан");
      }
      return PRODUCT_ITEM_CLIENT.fetchProduct(slug);
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 минуты для данных товара (менее динамичные)
    gcTime: 10 * 60 * 1000, // 10 минут для garbage collection
    // Используем initialData если передан (для SSR)
    ...(options?.initialData && { initialData: options.initialData }),
  });
}
