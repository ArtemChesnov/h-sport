/**
 * Компонент секции доставки и оплаты
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { MetricsSection, EmptyState } from "@/shared/components/admin";
import { formatMoney } from "@/shared/lib/formatters";
import { Truck, CreditCard, Info } from "lucide-react";

type DeliveryPaymentSectionProps = {
  delivery: {
    distribution: Array<{ method: string; count: number; percentage: number }>;
    averageDeliveryFee: number;
  };
  payment: {
    distribution: Array<{ method: string; count: number; percentage: number }>;
  };
  deliveryMethodLabels: Record<string, string>;
  paymentMethodLabels: Record<string, string>;
};

export function DeliveryPaymentSection({
  delivery,
  payment,
  deliveryMethodLabels,
  paymentMethodLabels,
}: DeliveryPaymentSectionProps) {
  return (
    <MetricsSection title="Доставка и оплата" description="Распределение по способам">
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">Доставка</CardTitle>
                  <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                </div>
                <CardDescription className="text-xs">Распределение по способам</CardDescription>
              </CardHeader>
              <CardContent>
                {!delivery.distribution || delivery.distribution.length === 0 ? (
                  <EmptyState
                    title="Нет данных"
                    description="За выбранный период нет данных о продажах"
                    icon={Truck}
                  />
                ) : (
                  <>
                    <div className="space-y-2">
                      {delivery.distribution.map(({ method, count, percentage }) => (
                        <div
                          key={method}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm font-medium">
                            {deliveryMethodLabels[method] || method}
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-semibold">{count} шт</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                      Средняя стоимость доставки: {formatMoney(delivery.averageDeliveryFee)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Распределение заказов по способам доставки за выбранный период. Показывает
              предпочтения клиентов и помогает оптимизировать логистику. Средняя стоимость доставки
              рассчитывается по всем заказам.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">Оплата</CardTitle>
                  <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                </div>
                <CardDescription className="text-xs">Распределение по способам</CardDescription>
              </CardHeader>
              <CardContent>
                {!payment.distribution || payment.distribution.length === 0 ? (
                  <EmptyState
                    title="Нет данных"
                    description="За выбранный период нет данных о продажах"
                    icon={CreditCard}
                  />
                ) : (
                  <div className="space-y-2">
                    {payment.distribution.map(({ method, count, percentage }) => (
                      <div
                        key={method}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          {paymentMethodLabels[method] || method}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{count} шт</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Распределение успешных оплат по способам оплаты за выбранный период. Показывает
              предпочтения клиентов в выборе платежных методов и помогает оптимизировать процесс
              оплаты.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </MetricsSection>
  );
}
