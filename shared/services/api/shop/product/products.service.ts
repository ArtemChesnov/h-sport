import type * as DTO from "../../../dto";
import {ApiRoutes, axiosInstance} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Список товаров (витрина).
 *
 * GET /api/shop/products
 */
export async function fetchProducts(
    params: DTO.ProductsQueryDto = {},
): Promise<DTO.ProductsListResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.ProductsListResponseDto>(
        ApiRoutes.SEARCH_PRODUCTS,
        { params },
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось получить список товаров"),
    );
  }
}
