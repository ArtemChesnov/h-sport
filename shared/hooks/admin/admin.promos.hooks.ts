
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DTO, PROMO_CLIENT_ADMIN } from "@/shared/services";

const keys = {
  list: (stable: string) => ["(admin)-promos", stable] as const,
};

function stableParamsKey(params: unknown): string {
  return JSON.stringify(params ?? {});
}

/**
 * Список промокодов (админка).
 */
export function useAdminPromoCodesQuery(
  params: DTO.AdminPromoCodesQueryDto = {},
) {
  const stable = stableParamsKey(params);

  return useQuery({
    queryKey: keys.list(stable),
    queryFn: () => PROMO_CLIENT_ADMIN.fetchAdminPromoCodes(params),
  });
}

/**
 * Создать промокод.
 */
export function useCreateAdminPromoCodeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: DTO.AdminPromoCodeCreateDto) =>
      PROMO_CLIENT_ADMIN.createAdminPromoCode(payload),
    onSuccess: async () => {
      // Инвалидируем и ждём завершения рефетча
      await qc.invalidateQueries({ queryKey: ["(admin)-promos"] });
    },
  });
}

/**
 * Обновить промокод.
 */
export function useUpdateAdminPromoCodeMutation() {
  const qc = useQueryClient();

  return useMutation<
    DTO.AdminPromoCodeDto,
    Error,
    { id: number; payload: DTO.AdminPromoCodeUpdateDto }
  >({
    mutationFn: (args: { id: number; payload: DTO.AdminPromoCodeUpdateDto }) =>
      PROMO_CLIENT_ADMIN.updateAdminPromoCode(args.id, args.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["(admin)-promos"] });
    },
  });
}

/**
 * Удалить промокод.
 */
export function useDeleteAdminPromoCodeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PROMO_CLIENT_ADMIN.deleteAdminPromoCode(id),
    onSuccess: async () => {
      // Инвалидируем и ждём завершения рефетча
      await qc.invalidateQueries({ queryKey: ["(admin)-promos"] });
    },
  });
}
