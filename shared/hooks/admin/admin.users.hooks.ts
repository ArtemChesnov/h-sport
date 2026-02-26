"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DTO } from "@/shared/services";
import {
  fetchAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
} from "@/shared/services";

/**
 * Базовый ключ списка пользователей админки.
 */
export const ADMIN_USERS_LIST_QUERY_KEY = ["(admin)", "users", "list"] as const;

type UpdateRoleVariables = {
  id: string;
  payload: DTO.AdminUserUpdateRequestDto;
};

/**
 * GET /api/(admin)/users
 */
export function useAdminUsersQuery(params: DTO.AdminUsersQueryDto = {}) {
  return useQuery<DTO.AdminUsersListResponseDto, Error>({
    queryKey: [...ADMIN_USERS_LIST_QUERY_KEY, params] as const,
    queryFn: () => fetchAdminUsers(params),
  });
}

/**
 * GET /api/(admin)/users/:id
 */
export function useAdminUserDetailQuery(id: string | null) {
  return useQuery<DTO.AdminUserDetailDto, Error>({
    queryKey: ["(admin)", "users", "detail", id] as const,
    enabled: typeof id === "string" && id.length > 0,
    queryFn: () => {
      if (!id) throw new Error("User id is required");
      return fetchAdminUser(id);
    },
  });
}

/**
 * PATCH /api/(admin)/users/:id/role
 */
export function useAdminUserUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DTO.AdminUserUpdateResponseDto,
    Error,
    UpdateRoleVariables
  >({
    mutationKey: ["(admin)", "users", "updateRole"] as const,
    mutationFn: ({ id, payload }) => updateAdminUserRole(id, payload),

    onSuccess: (data) => {
      // список пользователей (перезаберём, чтобы обновились роли)
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_LIST_QUERY_KEY });

      // деталка пользователя
      queryClient.invalidateQueries({
        queryKey: ["(admin)", "users", "detail", data.id],
      });
    },
  });
}
