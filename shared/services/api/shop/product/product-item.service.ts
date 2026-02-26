import type * as DTO from "../../../dto";
import {axiosInstance, buildProductItemUrl} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Детальная карточка товара (витрина).
 *
 * GET /api/shop/product/:slug
 */
export async function fetchProduct(slug: string): Promise<DTO.ProductDetailDto> {
  try {
    const { data } = await axiosInstance.get<DTO.ProductDetailDto>(
        buildProductItemUrl(slug),
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось получить карточку товара"),
    );
  }
}
