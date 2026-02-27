/**
 * Компонент секции эффективности промокодов
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
import { MetricsSection } from "@/shared/components/admin";
import { formatMoney } from "@/shared/lib/formatters";
import { METRICS_CONSTANTS } from "@/shared/constants";
import { TicketPercent, Info } from "lucide-react";

type PromoCodesSectionProps = {
  promoCodes: {
    total: number;
    usageRate: number;
    effectiveness: Array<{
      id: number;
      code: string;
      type: string;
      value: number;
      usageCount: number;
      totalRevenue: number;
      roi: number;
      avgDiscountPerOrder: number;
    }>;
  };
};

export function PromoCodesSection({ promoCodes }: PromoCodesSectionProps) {
  if (promoCodes.effectiveness.length === 0) {
    return null;
  }

  return (
    <MetricsSection title="Эффективность промокодов">
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm cursor-help">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TicketPercent className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Топ промокоды</CardTitle>
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                  </div>
                  <CardDescription className="text-xs">По выручке и ROI</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{promoCodes.total}</p>
                  <p className="text-xs text-muted-foreground">
                    Использование: {promoCodes.usageRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {promoCodes.effectiveness
                  .slice(0, METRICS_CONSTANTS.TOP_ITEMS_COUNT)
                  .map((promo) => (
                    <div
                      key={promo.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{promo.code}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {promo.type === "PERCENT"
                              ? `${promo.value}%`
                              : formatMoney(promo.value)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {promo.usageCount} использований · {formatMoney(promo.totalRevenue)}{" "}
                          выручка
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold">ROI: {promo.roi.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          Скидка: {formatMoney(promo.avgDiscountPerOrder)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed">
            Рейтинг промокодов по эффективности (ROI). Показывает, какие промокоды приносят
            наибольшую выручку относительно предоставленных скидок. ROI рассчитывается как (Выручка
            - Скидки) / Скидки × 100%.
          </p>
        </TooltipContent>
      </Tooltip>
    </MetricsSection>
  );
}
