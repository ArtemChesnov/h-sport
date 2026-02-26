"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type DTO, PRODUCT_CLIENT_ADMIN } from "@/shared/services";

const keys = {
  list: (stable: string) => ["(admin)-products", stable] as const,
  item: (slug: string) => ["(admin)-product", slug] as const,
};

function stableParamsKey(params: unknown): string {
  return JSON.stringify(params ?? {});
}

export function useAdminProductsQuery(
  params: DTO.ProductsQueryDto & {
    availability?: "available" | "unavailable";
  } = {},
) {
  const stable = stableParamsKey(params);

  return useQuery<DTO.AdminProductsListResponseDto>({
    queryKey: keys.list(stable),
    queryFn: () => PRODUCT_CLIENT_ADMIN.fetchAdminProducts(params),
  });
}

export function useAdminProductQuery(slug: string) {
  return useQuery<DTO.ProductDetailDto>({
    queryKey: keys.item(slug),
    queryFn: () => PRODUCT_CLIENT_ADMIN.fetchAdminProduct(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();

  return useMutation<DTO.ProductDetailDto, unknown, DTO.ProductCreateDto>({
    mutationFn: (payload) => PRODUCT_CLIENT_ADMIN.createProduct(payload),
    onSuccess: (created) => {
      qc.setQueryData(keys.item(created.slug), created);
      qc.invalidateQueries({ queryKey: ["(admin)-products"] });
    },
  });
}

export function useUpdateProductMutation(slug: string) {
  const qc = useQueryClient();

  return useMutation<DTO.ProductDetailDto, unknown, DTO.ProductUpdateDto>({
    mutationFn: (payload) => PRODUCT_CLIENT_ADMIN.updateProduct(slug, payload),
    onSuccess: (updated) => {
      // ✅ ключевое: сразу обновляем карточку
      qc.setQueryData(keys.item(slug), updated);

      // списки тоже можно обновить/инвалидировать
      qc.invalidateQueries({ queryKey: ["(admin)-products"] });
    },
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (slug) => PRODUCT_CLIENT_ADMIN.deleteProduct(slug),
    onSuccess: async (_void, slug) => {
      qc.removeQueries({ queryKey: keys.item(slug) });
      // invalidateQueries сам запускает рефетч активных запросов
      await qc.invalidateQueries({ queryKey: ["(admin)-products"] });
    },
  });
}
