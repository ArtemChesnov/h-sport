
import type { PaginationMetaDto } from "../base.dto";
import type { AdminOrderListItemDto } from "./admin.order.dto";

/**
 * Роль пользователя.
 * (Синхронизировано с Prisma enum Role: USER | ADMIN)
 */
export type UserRoleDto = "USER" | "ADMIN";

/**
 * Параметры запроса списка пользователей в админке.
 *
 * GET /api/(admin)/users
 */
export type AdminUsersQueryDto = {
  page?: number;
  perPage?: number;
  search?: string; // поиск по имени / фамилии / email / телефону
};

/**
 * Одна строка пользователя в админском списке.
 */
export type AdminUserListItemDto = {
  id: string;

  name?: string | null; // имя (без фамилии — чтобы компактно)
  email: string;
  phone?: string | null;

  role: UserRoleDto;

  createdAt: string;

  ordersCount: number; // количество заказов (учитываем только "покупочные" статусы)
  totalSpent: number; // сколько потратил (в копейках)
};

/**
 * Ответ на GET /api/(admin)/users
 */
export type AdminUsersListResponseDto = {
  items: AdminUserListItemDto[];
  meta: PaginationMetaDto;
};

/**
 * Деталка пользователя для админки.
 *
 * GET /api/(admin)/users/:id
 */
export type AdminUserDetailDto = {
  id: string;

  role: UserRoleDto;

  email: string;
  phone?: string | null;

  name?: string | null;
  secondName?: string | null;

  createdAt: string;

  ordersCount: number;
  totalSpent: number;

  lastOrderAt?: string | null;

  /**
   * Последние N заказов пользователя (для быстрого просмотра).
   */
  orders: AdminOrderListItemDto[];
};

/**
 * PATCH /api/(admin)/users/:id
 */
export type AdminUserUpdateRequestDto = {
  role: UserRoleDto;
};

export type AdminUserUpdateResponseDto = {
  id: string;
  role: UserRoleDto;
};
