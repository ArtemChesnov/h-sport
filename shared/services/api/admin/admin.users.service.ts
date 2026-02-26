
import { ApiRoutes, axiosInstance, buildAdminUserUrl } from "../../http";
import type * as DTO from "../../dto";
import { getApiErrorMessage } from "../api-errors";

/**
 * GET /api/(admin)/users
 */
export async function fetchAdminUsers(
  params: DTO.AdminUsersQueryDto = {},
): Promise<DTO.AdminUsersListResponseDto> {
  if (!params) params = {};

  try {
    const { data } = await axiosInstance.get<DTO.AdminUsersListResponseDto>(
      ApiRoutes.ADMIN_USERS,
      { params },
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список пользователей"),
    );
  }
}

/**
 * GET /api/(admin)/users/:id
 */
export async function fetchAdminUser(
  id: string,
): Promise<DTO.AdminUserDetailDto> {
  if (!id) throw new Error("User id is required");

  try {
    const { data } = await axiosInstance.get<DTO.AdminUserDetailDto>(
      buildAdminUserUrl(id),
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить пользователя"),
    );
  }
}

/**
 * PATCH /api/(admin)/users/:id
 */
export async function updateAdminUserRole(
  id: string,
  payload: DTO.AdminUserUpdateRequestDto,
): Promise<DTO.AdminUserUpdateResponseDto> {
  if (!id) throw new Error("User id is required");

  try {
    const { data } = await axiosInstance.patch<DTO.AdminUserUpdateResponseDto>(
      buildAdminUserUrl(id),
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось обновить пользователя"),
    );
  }
}
