import type * as DTO from "../../../dto";
import { ApiRoutes, axiosInstance, buildOrderUrl } from "../../../http";
import { getApiErrorMessage } from "../../api-errors";

/**
 * GET /api/shop/orders
 *
 * Список заказов текущего пользователя для ЛК с пагинацией.
 */
export async function fetchOrdersList(params?: {
  page?: number;
  perPage?: number;
}): Promise<DTO.OrdersListResponseDto> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page != null && params.page > 1) {
      searchParams.set("page", String(params.page));
    }
    if (params?.perPage != null && params.perPage !== 10) {
      searchParams.set("perPage", String(params.perPage));
    }
    const query = searchParams.toString();
    const url = query ? `${ApiRoutes.ORDERS}?${query}` : ApiRoutes.ORDERS;

    const { data } = await axiosInstance.get<DTO.OrdersListResponseDto>(url);
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список заказов"),
    );
  }
}

/**
 * GET /api/shop/orders/:uid
 *
 * Детальная информация по одному заказу.
 */
export async function fetchOrder(uid: string): Promise<DTO.OrderDetailDto> {
  try {
    const { data } = await axiosInstance.get<DTO.OrderDetailDto>(
        buildOrderUrl(uid),
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось получить заказ"),
    );
  }
}

/**
 * POST /api/shop/orders
 *
 * Создание заказа на основе текущей корзины.
 */
export async function createOrder(
    payload: DTO.OrderCreateRequestDto,
): Promise<DTO.OrderCreateResponseDto> {
  try {
    const { data } = await axiosInstance.post<DTO.OrderCreateResponseDto>(
        ApiRoutes.ORDERS,
        payload,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось создать заказ"),
    );
  }
}

