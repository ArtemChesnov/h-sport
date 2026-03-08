/**
 * Компонент секции топ категорий
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
import { METRICS_CONSTANTS } from "@/shared/constants";
import { BarChart3, Info } from "lucide-react";

type CategoriesSectionProps = {
  categories: Array<{
    name: string;
    views: number;
    orders: number;
    revenue: number;
    items: number;
    averageOrderValue: number;
  }>;
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <MetricsSection title="Категории" description="По выручке">
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm cursor-help">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Топ категорий</CardTitle>
                <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
              </div>
              <CardDescription className="text-xs">По выручке</CardDescription>
            </CardHeader>
            <CardContent>
              {!categories || categories.length === 0 ? (
                <EmptyState
                  title="Нет данных"
                  description="За выбранный период нет данных о продажах"
                  icon={BarChart3}
                />
              ) : (
                <div className="space-y-3">
                  {categories.slice(0, METRICS_CONSTANTS.TOP_ITEMS_COUNT).map((category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold shadow-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.views} просмотров · {category.orders} заказов ·{" "}
                            {category.items} товаров
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatMoney(category.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(category.averageOrderValue)} средний чек
                        </p>
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
            Рейтинг категорий товаров по выручке за выбранный период. Показывает, какие категории
            приносят наибольшую прибыль, включая количество просмотров, заказов и средний чек по
            категории.
          </p>
        </TooltipContent>
      </Tooltip>
    </MetricsSection>
  );
}
