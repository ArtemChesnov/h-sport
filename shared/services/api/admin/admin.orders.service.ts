
import { ApiRoutes, axiosInstance, buildAdminOrderUrl } from "../../http";
import type * as DTO from "../../dto";
import { getApiErrorMessage } from "../api-errors";

/**
 * Список заказов для админки.
 *
 * GET /api/(admin)/orders
 *
 * Параметры:
 *  - page?: number;
 *  - perPage?: number;
 *  - status?: OrderStatusDto;
 *  - email?: string;
 *  - phone?: string;
 *  - uid?: string;
 *  - q?: string; (общий поиск по uid/email/телефону)
 */
export async function fetchAdminOrders(
  params: DTO.AdminOrdersQueryDto = {},
): Promise<DTO.AdminOrdersListResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.AdminOrdersListResponseDto>(
      ApiRoutes.ADMIN_ORDERS,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список заказов"),
    );
  }
}

/**
 * Детальная информация по заказу для админки.
 *
 * GET /api/(admin)/orders/:id
 */
export async function fetchAdminOrder(id: number): Promise<DTO.OrderDetailDto> {
  if (!id || id <= 0) {
    throw new Error("Order id is required");
  }

  try {
    const { data } = await axiosInstance.get<DTO.OrderDetailDto>(
      buildAdminOrderUrl(id),
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось получить заказ"));
  }
}

/**
 * Частичное обновление заказа из админки.
 *
 * PATCH /api/(admin)/orders/:id
 */
export async function updateAdminOrder(
  id: number,
  payload: DTO.OrderAdminUpdateRequestDto,
): Promise<DTO.OrderAdminUpdateResponseDto> {
  if (!id || id <= 0) {
    throw new Error("Order id is required");
  }

  try {
    const { data } = await axiosInstance.patch<DTO.OrderAdminUpdateResponseDto>(
      buildAdminOrderUrl(id),
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось обновить заказ"));
  }
}
