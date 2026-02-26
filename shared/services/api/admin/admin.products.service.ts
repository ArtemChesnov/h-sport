
import type * as DTO from "../../dto";
import { ApiRoutes, axiosInstance, buildAdminProductUrl } from "../../http";
import { getApiErrorMessage } from "../api-errors";

/**
 * Список товаров (админка).
 *
 * GET /api/(admin)/products
 */
export async function fetchAdminProducts(
  params: DTO.ProductsQueryDto & {
    availability?: "available" | "unavailable";
  } = {},
): Promise<DTO.AdminProductsListResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.AdminProductsListResponseDto>(
      ApiRoutes.ADMIN_PRODUCTS,
      { params },
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список товаров"),
    );
  }
}

/**
 * Товар (админка) по slug.
 *
 * GET /api/(admin)/products/:slug
 */
export async function fetchAdminProduct(
  slug: string,
): Promise<DTO.ProductDetailDto> {
  try {
    const { data } = await axiosInstance.get<DTO.ProductDetailDto>(
      buildAdminProductUrl(slug),
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось получить товар"));
  }
}

/**
 * Создание товара.
 *
 * POST /api/(admin)/products
 */
export async function createProduct(
  payload: DTO.ProductCreateDto,
): Promise<DTO.ProductDetailDto> {
  try {
    const { data } = await axiosInstance.post<DTO.ProductDetailDto>(
      ApiRoutes.ADMIN_PRODUCTS,
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось создать товар"));
  }
}

/**
 * Обновление товара.
 *
 * PATCH /api/(admin)/products/:slug
 */
export async function updateProduct(
  slug: string,
  payload: DTO.ProductUpdateDto,
): Promise<DTO.ProductDetailDto> {
  try {
    const { data } = await axiosInstance.patch<DTO.ProductDetailDto>(
      buildAdminProductUrl(slug),
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось обновить товар"));
  }
}

/**
 * Удаление товара.
 *
 * DELETE /api/(admin)/products/:slug
 */
export async function deleteProduct(slug: string): Promise<void> {
  try {
    await axiosInstance.delete(buildAdminProductUrl(slug));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось удалить товар"));
  }
}
