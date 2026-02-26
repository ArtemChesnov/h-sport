"use client";

import { DTO, ORDER_CANCEL_CLIENT, ORDER_CLIENT } from "@/shared/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "../cart/cart.hooks";

/**
 * Ключ для списка заказов пользователя в ЛК.
 *
 * Используется в:
 *  - useOrdersListQuery;
 *  - инвалидируется при создании/отмене заказа и изменении заказа в админке.
 */
export const ORDERS_LIST_QUERY_KEY = ["orders", "list"] as const;

/**
 * Ключ для деталки заказа по uid.
 */
export const orderDetailQueryKey = (uid: string | number) => ["orders", "detail", uid] as const;

/**
 * Список заказов текущего пользователя для ЛК с пагинацией.
 *
 * Использование:
 *   const { data, isLoading, isError } = useOrdersListQuery({ page: 1, perPage: 10 });
 */
export function useOrdersListQuery(params?: {
  page?: number;
  perPage?: number;
}) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 10;

  return useQuery<DTO.OrdersListResponseDto>({
    queryKey: [...ORDERS_LIST_QUERY_KEY, page, perPage],
    queryFn: () => ORDER_CLIENT.fetchOrdersList({ page, perPage }),
  });
}

/**
 * Детальная информация по заказу.
 *
 * uid — публичный идентификатор заказа (Order.uid),
 * который мы отдаём в OrderShortDto и OrderCreateResponseDto.
 *
 * Использование:
 *   const { data, isLoading } = useOrderDetailQuery(orderUid);
 */
export function useOrderDetailQuery(uid: string | undefined) {
  return useQuery<DTO.OrderDetailDto>({
    queryKey: ["orders", "detail", uid],
    enabled: !!uid,
    queryFn: () => {
      if (!uid) {
        // enabled: false защитит от реального вызова, но на всякий случай.
        throw new Error("Order UID is required");
      }

      return ORDER_CLIENT.fetchOrder(uid);
    },
  });
}

/**
 * Мутация создания заказа.
 *
 * Использование:
 *   const createOrderMutation = useCreateOrderMutation();
 *
 *   createOrderMutation.mutate(
 *     {
 *       email: "...",
 *       delivery: { method: "CDEK_COURIER", city: "...", address: "..." },
 *     },
 *     {
 *       onSuccess: (order) => { router.push(`/account/orders/${order.uid}`); },
 *     },
 *   );
 */
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<DTO.OrderCreateResponseDto, unknown, DTO.OrderCreateRequestDto>({
    mutationFn: (payload) => ORDER_CLIENT.createOrder(payload),
    onSuccess: (_order) => {
      // Список заказов устарел — перезапрашиваем.
      queryClient.invalidateQueries({ queryKey: ORDERS_LIST_QUERY_KEY });

      // Корзина тоже устарела.
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      // Редирект на страницу заказа делаем в самом компоненте.
    },
  });
}


/**
 * Мутация инициации оплаты заказа.
 * Вызывает POST /api/shop/orders/[uid]/pay и редиректит на URL оплаты.
 */
export function usePayOrderMutation() {
  return useMutation<string, Error, string>({
    mutationKey: ["orders", "pay"],
    mutationFn: async (uid) => {
      const res = await fetch(`/api/shop/orders/${uid}/pay?returnTo=order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Ошибка при создании платежа");
      if (!json.url) throw new Error("Не получен URL для оплаты");
      return json.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}

/**
 * Мутация отмены заказа пользователем.
 *
 * Используется на странице ЛК /account/orders/[uid],
 * чтобы по кнопке "Отменить заказ" дернуть POST /api/shop/orders/:uid/cancel.
 */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<DTO.OrderCancelResponseDto, Error, { uid: string | number }>({
    mutationKey: ["orders", "cancel"],
    mutationFn: ({ uid }) => ORDER_CANCEL_CLIENT.cancelOrder(uid),
    onSuccess: (data) => {
      // Обновляем список заказов в ЛК.
      queryClient.invalidateQueries({ queryKey: ORDERS_LIST_QUERY_KEY });

      // Обновляем деталку конкретного заказа (если открыта).
      queryClient.invalidateQueries({
        queryKey: orderDetailQueryKey(data.uid),
      });
    },
  });
}

