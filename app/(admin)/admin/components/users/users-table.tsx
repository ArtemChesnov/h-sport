"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/components/ui";
import {
  VirtualizedTable,
  type VirtualizedTableColumn,
} from "@/shared/components/common/virtualized-table";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib/formatters";
// Порог для включения виртуализации
const VIRTUALIZATION_THRESHOLD = 50;

/**
 * Роль — компактный бейдж.
 */
function RoleBadge({ role }: { role: DTO.UserRoleDto }) {
  const label = role === "ADMIN" ? "Администратор" : "Пользователь";
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-all ${
        isAdmin
          ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200/50"
          : "bg-gradient-to-r from-slate-100 to-zinc-100 text-slate-700 border border-slate-200/50"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * Короткая дата.
 */
function formatDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Moscow",
  });
}

type UsersTableProps = {
  users: DTO.AdminUserListItemDto[];
};

/**
 * Таблица пользователей с виртуализацией для больших списков
 */
export function UsersTable(props: UsersTableProps) {
  const { users } = props;
  const router = useRouter();

  if (users.length === 0) {
    return <div className="px-1 py-6 text-sm text-muted-foreground">Пользователей не найдено.</div>;
  }

  const handleRowClick = (user: DTO.AdminUserListItemDto) => {
    router.push(`/admin/users/${user.id}`);
  };

  // Определяем колонки для виртуализованной таблицы
  const columns: VirtualizedTableColumn<DTO.AdminUserListItemDto>[] = [
    {
      id: "name",
      header: "Пользователь",
      headerClassName: "pl-4",
      className: "pl-4",
      cell: (user) => (
        <Link
          href={`/admin/users/${user.id}`}
          className="font-semibold text-foreground transition-colors hover:text-slate-700 hover:underline text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {user.name || "Без имени"}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: (user) => (
        <span className="text-sm text-muted-foreground truncate max-w-[260px] block">
          {user.email}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Телефон",
      width: "160px",
      cell: (user) => <span className="text-sm text-muted-foreground">{user.phone || "—"}</span>,
    },
    {
      id: "role",
      header: "Роль",
      width: "140px",
      cell: (user) => <RoleBadge role={user.role} />,
    },
    {
      id: "orders",
      header: "Заказов",
      width: "100px",
      headerClassName: "text-right",
      className: "text-right",
      cell: (user) => (
        <span className="text-sm font-medium text-indigo-700">{user.ordersCount}</span>
      ),
    },
    {
      id: "spent",
      header: "Потратил",
      width: "120px",
      headerClassName: "text-right",
      className: "text-right",
      cell: (user) => (
        <span className="text-sm font-semibold text-emerald-700">
          {formatMoney(user.totalSpent)}
        </span>
      ),
    },
    {
      id: "created",
      header: "Регистрация",
      width: "140px",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      width: "60px",
      headerClassName: "text-right pr-4",
      className: "text-right pr-4",
      cell: (user) => (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Открыть пользователя"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/admin/users/${user.id}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  // Используем виртуализацию только для больших списков
  if (users.length >= VIRTUALIZATION_THRESHOLD) {
    return (
      <div className="-mx-2 md:mx-0">
        <VirtualizedTable<DTO.AdminUserListItemDto>
          data={users}
          columns={columns}
          rowHeight={56}
          maxHeight={600}
          onRowClick={handleRowClick}
          getRowKey={(user) => user.id}
          emptyMessage="Пользователей не найдено"
        />
      </div>
    );
  }

  // Для небольших списков используем обычную таблицу
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background -mx-2 md:mx-0">
      <div className="min-w-[900px]">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 hover:bg-muted/40 border-b border-border/50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  className={`font-semibold text-xs h-12 align-middle px-4 text-left ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="group border-b border-border/30 transition-all hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-zinc-50/50 hover:shadow-sm cursor-pointer"
                onClick={() => handleRowClick(user)}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    style={{ width: col.width }}
                    className={`h-14 align-middle px-4 ${col.className || ""}`}
                  >
                    {col.cell(user, 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
