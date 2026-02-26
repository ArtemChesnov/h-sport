/**
 * Админка: список пользователей, деталка, обновление роли.
 */

import { prisma } from "@/prisma/prisma-client";
import { OrderStatus } from "@prisma/client";
import { getExcludePrivilegedUserWhere } from "@/shared/lib/auth/privileged";
import { buildPaginatedResponse, calculateSkip } from "@/shared/lib";
import type { DTO } from "@/shared/services";

const PURCHASE_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export type AdminUsersListParams = {
  search: string;
  page: number;
  perPage: number;
};

/**
 * Список пользователей с пагинацией и агрегатами заказов.
 */
export async function getAdminUsersList(
  params: AdminUsersListParams,
): Promise<DTO.AdminUsersListResponseDto> {
  const searchWhere =
    params.search.length > 0
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { secondName: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};
  const where = { ...searchWhere, ...getExcludePrivilegedUserWhere() };

  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: calculateSkip(params.page, params.perPage),
    take: params.perPage,
    select: {
      id: true,
      role: true,
      email: true,
      phone: true,
      name: true,
      createdAt: true,
    },
  });

  const userIds = users.map((u) => u.id);

  const orderAgg =
    userIds.length > 0
      ? await prisma.order.groupBy({
          by: ["userId"],
          where: {
            userId: { in: userIds },
            status: { in: PURCHASE_STATUSES },
          },
          _count: { _all: true },
          _sum: { total: true },
        })
      : [];

  const aggByUserId = new Map<string, { ordersCount: number; totalSpent: number }>();
  for (const row of orderAgg) {
    const uid = row.userId;
    if (!uid) continue;
    aggByUserId.set(uid, {
      ordersCount: row._count._all ?? 0,
      totalSpent: row._sum.total ?? 0,
    });
  }

  const items: DTO.AdminUserListItemDto[] = users.map((u) => {
    const agg = aggByUserId.get(u.id);
    return {
      id: u.id,
      role: u.role as DTO.UserRoleDto,
      email: u.email,
      phone: u.phone,
      name: u.name,
      createdAt: u.createdAt.toISOString(),
      ordersCount: agg?.ordersCount ?? 0,
      totalSpent: agg?.totalSpent ?? 0,
    };
  });

  return buildPaginatedResponse(items, total, params.page, params.perPage);
}

/**
 * Деталка пользователя по id с заказами и метриками.
 */
export async function getAdminUserById(
  id: string,
): Promise<DTO.AdminUserDetailDto | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      email: true,
      phone: true,
      name: true,
      secondName: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const agg = await prisma.order.aggregate({
    where: { userId: id, status: { in: PURCHASE_STATUSES } },
    _count: { _all: true },
    _sum: { total: true },
  });

  const lastOrder = await prisma.order.findFirst({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      uid: true,
      status: true,
      createdAt: true,
      total: true,
      totalItems: true,
      email: true,
      phone: true,
      fullName: true,
    },
  });

  return {
    id: user.id,
    role: user.role as DTO.UserRoleDto,
    email: user.email,
    phone: user.phone,
    name: user.name,
    secondName: user.secondName,
    createdAt: user.createdAt.toISOString(),
    ordersCount: agg._count._all ?? 0,
    totalSpent: agg._sum.total ?? 0,
    lastOrderAt: lastOrder?.createdAt?.toISOString?.() ?? null,
    orders: orders.map((o) => ({
      id: o.id,
      uid: o.uid,
      status: o.status as DTO.OrderStatusDto,
      createdAt: o.createdAt.toISOString(),
      total: o.total,
      totalItems: o.totalItems,
      email: o.email,
      phone: o.phone,
      fullName: o.fullName,
    })),
  };
}

/**
 * Обновление роли пользователя.
 */
export async function updateAdminUserRole(
  id: string,
  role: DTO.UserRoleDto,
): Promise<DTO.AdminUserUpdateResponseDto> {
  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, role: true },
  });
  return { id: updated.id, role: updated.role as DTO.UserRoleDto };
}
