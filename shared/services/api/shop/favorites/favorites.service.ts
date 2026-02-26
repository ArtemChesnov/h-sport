import type * as DTO from "../../../dto";
import {ApiRoutes, axiosInstance} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Избранное.
 *
 * GET /api/shop/favorites
 */
export async function fetchFavorites(): Promise<DTO.FavoritesResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.FavoritesResponseDto>(
        ApiRoutes.FAVORITES,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось получить избранные товары"),
    );
  }
}

/**
 * Добавить товар в избранное.
 *
 * POST /api/shop/favorites
 * Body: { productId }
 */
export async function addFavorite(
    productId: number,
): Promise<DTO.FavoritesResponseDto> {
  try {
    const { data } = await axiosInstance.post<DTO.FavoritesResponseDto>(
        ApiRoutes.FAVORITES,
        { productId },
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось добавить товар в избранное"),
    );
  }
}

/**
 * Удалить товар из избранного.
 *
 * DELETE /api/shop/favorites/:productId
 */
export async function removeFavorite(
    productId: number,
): Promise<DTO.FavoritesResponseDto> {
  try {
    const { data } = await axiosInstance.delete<DTO.FavoritesResponseDto>(
        `${ApiRoutes.FAVORITES}/${productId}`,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось удалить товар из избранного"),
    );
  }
}
