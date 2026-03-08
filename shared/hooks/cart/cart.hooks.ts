/**
 * Хуки для работы с корзиной.
 *
 * Best practices:
 * 1. Один QueryKey для всех подписчиков
 * 2. Оптимистичные обновления в onMutate для мгновенной реакции UI
 * 3. Замена данных из ответа сервера в onSuccess (без invalidate!)
 * 4. Откат при ошибке в onError
 */

"use client";

import { CART_CLIENT, DTO } from "@/shared/services";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export const CART_QUERY_KEY = ["cart"] as const;

/**
 * Сортирует items корзины по id для стабильного порядка.
 */
function sortCartItems(items: DTO.CartItemDto[]): DTO.CartItemDto[] {
  return [...items].sort((a, b) => a.id - b.id);
}

/**
 * Применяет сортировку к данным корзины.
 */
export function withSortedItems(cart: DTO.CartDto): DTO.CartDto {
  return {
    ...cart,
    items: sortCartItems(cart.items),
  };
}

/**
 * Хук для получения текущей корзины.
 */
export function useCartQuery<TData = DTO.CartDto>(
  options?: Omit<UseQueryOptions<DTO.CartDto, Error, TData>, "queryKey" | "queryFn">
) {
  return useQuery<DTO.CartDto, Error, TData>({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const data = await CART_CLIENT.fetchCart();
      return withSortedItems(data);
    },
    ...options,
  });
}

/**
 * Добавление позиции в корзину.
 */
export function useAddCartItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["cart-add-item"],
    mutationFn: (payload: DTO.CartAddItemDto) => CART_CLIENT.addCartItem(payload),

    // 1. Оптимистичное обновление — мгновенная реакция UI
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousData = qc.getQueryData<DTO.CartDto>(CART_QUERY_KEY);

      if (previousData) {
        // Оптимистично увеличиваем totalItems на qty
        const optimisticCart: DTO.CartDto = {
          ...previousData,
          totalItems: previousData.totalItems + payload.qty,
        };
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, optimisticCart);
      }

      return { previousData };
    },

    // 2. При успехе — заменяем кэш данными сервера (сохраняем стабильный порядок по id)
    onSuccess: (data) => {
      qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, withSortedItems(data));
    },

    // 3. При ошибке — откат
    onError: (_err, _payload, context) => {
      if (context?.previousData) {
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, context.previousData);
      }
    },
  });
}

/**
 * Изменение количества позиции в корзине.
 */
type UpdateCartItemArgs = {
  id: number;
  qty: number;
};

export function useUpdateCartItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["cart-update-item"],
    mutationFn: ({ id, qty }: UpdateCartItemArgs) => CART_CLIENT.updateCartItem(id, { qty }),

    // 1. Оптимистичное обновление
    onMutate: async ({ id, qty }) => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousData = qc.getQueryData<DTO.CartDto>(CART_QUERY_KEY);

      if (previousData) {
        const updatedItems = previousData.items.map((item) =>
          item.id === id ? { ...item, qty } : item
        );
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.qty, 0);

        const optimisticCart: DTO.CartDto = {
          ...previousData,
          items: updatedItems,
          totalItems: newTotalItems,
        };
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, optimisticCart);
      }

      return { previousData };
    },

    // 2. При успехе — данные сервера (сохраняем стабильный порядок по id)
    onSuccess: (data) => {
      qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, withSortedItems(data));
    },

    // 3. При ошибке — откат
    onError: (_err, _args, context) => {
      if (context?.previousData) {
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, context.previousData);
      }
    },
  });
}

/**
 * Удаление позиции из корзины.
 */
export function useDeleteCartItemMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["cart-delete-item"],
    mutationFn: (id: number) => CART_CLIENT.deleteCartItem(id),

    // 1. Оптимистичное обновление
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousData = qc.getQueryData<DTO.CartDto>(CART_QUERY_KEY);

      if (previousData) {
        const deletedItem = previousData.items.find((item) => item.id === id);
        const deletedQty = deletedItem?.qty ?? 0;

        const optimisticCart: DTO.CartDto = {
          ...previousData,
          items: previousData.items.filter((item) => item.id !== id),
          totalItems: Math.max(0, previousData.totalItems - deletedQty),
        };
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, optimisticCart);
      }

      return { previousData };
    },

    // 2. При успехе — данные сервера (сохраняем стабильный порядок по id)
    onSuccess: (data) => {
      qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, withSortedItems(data));
    },

    // 3. При ошибке — откат
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        qc.setQueryData<DTO.CartDto>(CART_QUERY_KEY, context.previousData);
      }
    },
  });
}

/**
 * Счётчик корзины для Header.
 * Использует кэш из useCartQuery для избежания лишних запросов.
 * select возвращает примитив (number), что гарантирует ререндер
 * при любом изменении totalItems.
 */
export function useCartCount() {
  const { data: totalItems, isLoading } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => CART_CLIENT.fetchCart(),
    select: (cart) => cart?.totalItems ?? 0,
    // Используем кэш вместо refetch при монтировании (Header рендерится на каждой странице)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 минут - данные корзины редко меняются без действий пользователя
  });

  if (isLoading) {
    return null;
  }

  return totalItems ?? 0;
}
