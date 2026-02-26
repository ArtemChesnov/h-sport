
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DTO } from "@/shared/services";
import {
  fetchAdminOrder,
  fetchAdminOrders,
  updateAdminOrder,
} from "@/shared/services";

export const ADMIN_ORDERS_LIST_QUERY_KEY = [
  "(admin)",
  "orders",
  "list",
] as const;

type UpdateVariables = {
  id: number;
  payload: DTO.OrderAdminUpdateRequestDto;
};

export function useAdminOrdersListQuery(params: DTO.AdminOrdersQueryDto = {}) {
  return useQuery<DTO.AdminOrdersListResponseDto, Error>({
    queryKey: [...ADMIN_ORDERS_LIST_QUERY_KEY, params] as const,
    queryFn: () => fetchAdminOrders(params),
  });
}

export function useAdminOrderDetailQuery(id: number | null) {
  return useQuery<DTO.OrderDetailDto, Error>({
    queryKey: ["(admin)", "orders", "detail", id] as const,
    enabled: typeof id === "number" && id > 0,
    queryFn: () => {
      if (!id || id <= 0) throw new Error("Order id is required");
      return fetchAdminOrder(id);
    },
  });
}

export function useAdminOrderUpdateMutation() {
  const queryClient = useQueryClient();

  return useMutation<DTO.OrderAdminUpdateResponseDto, Error, UpdateVariables>({
    mutationKey: ["(admin)", "orders", "update"] as const,
    mutationFn: ({ id, payload }) => updateAdminOrder(id, payload),

    onSuccess: (data) => {
      // ✅ Мгновенно обновляем кэш деталки (без ожидания refetch)
      queryClient.setQueryData(["(admin)", "orders", "detail", data.id], data);

      // список админки — пусть обновится (там фильтры/пагинация)
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_LIST_QUERY_KEY });

      // клиентский ЛК (опционально)
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", data.uid],
      });
    },
  });
}
