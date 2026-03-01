"use client";

import type { VirtualizedTableColumn } from "@/shared/components/common/virtualized-table";
import { VirtualizedTable } from "@/shared/components/common/virtualized-table";
import { Button } from "@/shared/components/ui";
import { ADMIN_ORDER_DELIVERY_METHOD_OPTIONS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { useCopyToClipboard } from "@/shared/hooks/common/use-copy-to-clipboard";
import { formatMoney } from "@/shared/lib/formatters";
import { getOrderStatusBadgeStyles } from "@/shared/lib/styles";
import { DTO } from "@/shared/services";
import { CheckCircle2, Copy, Hash, PencilIcon, Truck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { getOrderStatusLabel } from "../../orders/lib/constants";

type OrdersTableProps = {
  orders: DTO.AdminOrderListItemDto[];
};

// Порог для включения виртуализации
const VIRTUALIZATION_THRESHOLD = 50;

/**
 * Таблица заказов с виртуализацией для больших списков
 */
export function OrdersTable(props: OrdersTableProps) {
  const { orders } = props;
  const router = useRouter();
  const { copyToClipboard } = useCopyToClipboard({
    successMessage: TOAST.SUCCESS.UID_COPIED,
    errorMessage: TOAST.ERROR.FAILED_TO_COPY,
  });

  const handleCopyUid = useCallback(
    (e: React.MouseEvent, uid: string) => {
      e.stopPropagation();
      copyToClipboard(uid, TOAST.SUCCESS.UID_COPIED);
    },
    [copyToClipboard]
  );

  const handleRowClick = useCallback(
    (order: DTO.AdminOrderListItemDto) => {
      router.push(`/admin/orders/${order.id}`);
    },
    [router]
  );

  if (orders.length === 0) {
    return (
      <div className="px-2 py-6 text-sm text-muted-foreground">
        Заказов по текущим фильтрам не найдено.
      </div>
    );
  }

  // Определяем колонки для виртуализованной таблицы
  const columns: VirtualizedTableColumn<DTO.AdminOrderListItemDto>[] = [
    {
      id: "id",
      header: "ID",
      width: "70px",
      headerClassName: "pl-4",
      className: "pl-4",
      cell: (order) => (
        <span className="text-xs font-mono font-medium text-muted-foreground">#{order.id}</span>
      ),
    },
    {
      id: "date",
      header: "Дата",
      width: "180px",
      cell: (order) => (
        <span className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      id: "status",
      header: "Статус",
      width: "160px",
      cell: (order) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap uppercase tracking-wide ${getOrderStatusBadgeStyles(order.status)}`}
        >
          {getOrderStatusLabel(order.status)}
        </span>
      ),
    },
    {
      id: "total",
      header: "Сумма",
      width: "120px",
      cell: (order) => (
        <span className="text-xs font-semibold text-emerald-700">{formatMoney(order.total)}</span>
      ),
    },
    {
      id: "payment",
      header: "Оплата",
      width: "100px",
      headerClassName: "text-center",
      className: "text-center",
      cell: (order) => {
        const hasPaidPayment = order.hasPaidPayment ?? false;
        return hasPaidPayment ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <XCircle className="h-3.5 w-3.5" />
          </span>
        );
      },
    },
    {
      id: "delivery",
      header: "Доставка",
      width: "140px",
      cell: (order) => {
        const deliveryMethod = order.deliveryMethod;
        const trackingCode = order.trackingCode;
        const deliveryMethodLabel = deliveryMethod
          ? (ADMIN_ORDER_DELIVERY_METHOD_OPTIONS.find((opt) => opt.value === deliveryMethod)
              ?.label ?? deliveryMethod)
          : "—";

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span className="text-[11px]">{deliveryMethodLabel}</span>
            </div>
            {trackingCode && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="text-[10px] font-mono">{trackingCode}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Товаров",
      width: "80px",
      cell: (order) => <span className="text-xs text-muted-foreground">{order.totalItems} шт</span>,
    },
    {
      id: "customer",
      header: "Клиент",
      cell: (order) => (
        <div>
          <div className="font-semibold text-foreground text-xs">{order.fullName || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{order.email}</div>
          {order.phone && <div className="text-[11px] text-muted-foreground">{order.phone}</div>}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      width: "100px",
      headerClassName: "text-right pr-4",
      className: "text-right pr-4",
      cell: (order) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-slate-100"
            onClick={(e) => handleCopyUid(e, order.uid)}
            aria-label={`Скопировать UID ${order.uid}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-indigo-100 hover:text-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/orders/${order.id}`);
            }}
            aria-label={`Перейти к заказу ${order.id}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Используем виртуализацию только для больших списков
  if (orders.length >= VIRTUALIZATION_THRESHOLD) {
    return (
      <div className="-mx-2 md:mx-0">
        <VirtualizedTable
          data={orders}
          columns={columns}
          rowHeight={72}
          maxHeight={600}
          onRowClick={handleRowClick}
          getRowKey={(order) => order.id}
          emptyMessage="Заказов не найдено"
        />
      </div>
    );
  }

  // Для небольших списков используем обычную таблицу
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background -mx-2 md:mx-0">
      <div className="min-w-[1000px]">
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
            {orders.map((order) => (
              <tr
                key={order.id}
                className="group border-b border-border/30 transition-all hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 hover:shadow-sm cursor-pointer"
                onClick={() => handleRowClick(order)}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    style={{ width: col.width }}
                    className={`h-14 align-middle px-4 ${col.className || ""}`}
                  >
                    {col.cell(order, 0)}
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
