import {axiosInstance, buildOrderCancelUrl} from "../../../http";
import type * as DTO from "../../../dto";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Отмена заказа пользователем.
 *
 * POST /api/shop/orders/:uid/cancel
 */
export async function cancelOrder(
    uid: string | number,
): Promise<DTO.OrderCancelResponseDto> {
  try {
    const { data } = await axiosInstance.post<DTO.OrderCancelResponseDto>(
        buildOrderCancelUrl(uid),
    );

    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось отменить заказ"),
    );
  }
}
