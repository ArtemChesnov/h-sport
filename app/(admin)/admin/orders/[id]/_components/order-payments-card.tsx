"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/shared/components/ui";
import { CreditCard } from "lucide-react";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib/formatters";
import {
  getPaymentStatusBadgeStyles,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
} from "@/shared/lib/styles";

type OrderPaymentsCardProps = {
  order: DTO.OrderDetailDto;
};

/**
 * Карточка с информацией о платежах
 */
export function OrderPaymentsCard({ order }: OrderPaymentsCardProps) {
  const payments = order.payments || [];

  if (payments.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-violet-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-5 w-5 text-violet-600" />
          <CardTitle className="text-base font-semibold">Платежи</CardTitle>
        </div>
        <CardDescription className="text-xs">Информация о платежах по заказу</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg border border-border/40 bg-gradient-to-br from-white to-muted/10 p-4 space-y-3 transition-all hover:shadow-md hover:border-violet-200/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="text-sm font-semibold">Платеж #{payment.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleString("ru-RU")}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${getPaymentStatusBadgeStyles(payment.status)}`}
                >
                  {getPaymentStatusLabel(payment.status)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Сумма</div>
                  <div className="font-semibold text-base">{formatMoney(payment.amount)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Способ оплаты</div>
                  <div className="font-medium">{getPaymentMethodLabel(payment.method)}</div>
                </div>
              </div>

              {payment.receiptUrl && (
                <>
                  <Separator className="my-2" />
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                    >
                      <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                        Открыть чек
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                    >
                      <a
                        href={`${payment.receiptUrl}${payment.receiptUrl.includes("?") ? "&" : "?"}format=pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Скачать PDF
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
