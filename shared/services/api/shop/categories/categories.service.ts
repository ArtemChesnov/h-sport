import type * as DTO from "../../../dto";
import {ApiRoutes, axiosInstance} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Категории (витрина).
 *
 * GET /api/shop/categories
 */
export async function fetchCategories(): Promise<DTO.CategoriesResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.CategoriesResponseDto>(
        ApiRoutes.CATEGORIES,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось получить список категорий"),
    );
  }
}
