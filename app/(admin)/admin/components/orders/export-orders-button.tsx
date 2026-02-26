"use client";

import { Button } from "@/shared/components/ui";
import { TOAST } from "@/shared/constants";
import { formatMoney } from "@/shared/lib";
import { DTO } from "@/shared/services";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, formatDateForExport } from "../../lib/export";

type ExportOrdersButtonProps = {
  orders: DTO.AdminOrderListItemDto[];
  disabled?: boolean;
};

export function ExportOrdersButton({ orders, disabled }: ExportOrdersButtonProps) {
  const handleExport = () => {
    if (orders.length === 0) {
      toast.error(TOAST.ERROR.NO_DATA_EXPORT);
      return;
    }

    try {
      const exportData = orders.map((order) => ({
        id: order.id,
        uid: order.uid,
        status: order.status,
        createdAt: formatDateForExport(order.createdAt),
        total: formatMoney(order.total),
        totalItems: order.totalItems,
        email: order.email,
        phone: order.phone || "",
        fullName: order.fullName || "",
        deliveryMethod: order.deliveryMethod || "",
        trackingCode: order.trackingCode || "",
        hasPaidPayment: order.hasPaidPayment ? "Да" : "Нет",
      }));

      exportToCSV(exportData, "orders", {
        id: "ID",
        uid: "UID",
        status: "Статус",
        createdAt: "Дата создания",
        total: "Сумма",
        totalItems: "Товаров",
        email: "Email",
        phone: "Телефон",
        fullName: "ФИО",
        deliveryMethod: "Способ доставки",
        trackingCode: "Трек-номер",
        hasPaidPayment: "Оплачен",
      });

      toast.success(TOAST.SUCCESS.EXPORT_DONE, {
        description: `Экспортировано ${orders.length} заказов`,
      });
    } catch (error) {
      toast.error(TOAST.ERROR.EXPORT_ERROR, {
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || orders.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Экспорт CSV
    </Button>
  );
}
