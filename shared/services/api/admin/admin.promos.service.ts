
import type * as DTO from "../../dto";
import { ApiRoutes, axiosInstance, buildAdminPromoCodesUrl } from "../../http";
import { getApiErrorMessage } from "../api-errors";

/**
 * Список промокодов (админка).
 *
 * GET /api/(admin)/promos
 */
export async function fetchAdminPromoCodes(
  params: DTO.AdminPromoCodesQueryDto = {},
): Promise<DTO.AdminPromoCodesListResponseDto> {
  try {
    const { data } =
      await axiosInstance.get<DTO.AdminPromoCodesListResponseDto>(
        ApiRoutes.ADMIN_PROMOS,
        { params },
      );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список промокодов"),
    );
  }
}

/**
 * Создание промокода.
 *
 * POST /api/(admin)/promos
 */
export async function createAdminPromoCode(
  payload: DTO.AdminPromoCodeCreateDto,
): Promise<DTO.AdminPromoCodeDto> {
  try {
    const { data } = await axiosInstance.post<DTO.AdminPromoCodeDto>(
      ApiRoutes.ADMIN_PROMOS,
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось создать промокод"));
  }
}

/**
 * Обновление промокода.
 *
 * PATCH /api/(admin)/promos/:id
 */
export async function updateAdminPromoCode(
  id: number,
  payload: DTO.AdminPromoCodeUpdateDto,
): Promise<DTO.AdminPromoCodeDto> {
  try {
    const { data } = await axiosInstance.patch<DTO.AdminPromoCodeDto>(
      buildAdminPromoCodesUrl(id),
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось обновить промокод"));
  }
}

/**
 * Удаление промокода.
 *
 * DELETE /api/(admin)/promos/:id
 */
export async function deleteAdminPromoCode(id: number): Promise<void> {
  try {
    await axiosInstance.delete(buildAdminPromoCodesUrl(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось удалить промокод"));
  }
}
