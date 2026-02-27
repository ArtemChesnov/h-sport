/**
 * Компонент секции статистики по размерам и цветам
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
import { Package, Info } from "lucide-react";

type ProductVariantsSectionProps = {
  sizes: Array<{
    size: string;
    count: number;
    revenue: number;
  }>;
  colors: Array<{
    color: string;
    count: number;
    revenue: number;
  }>;
  topCombinations: Array<{
    size: string;
    color: string;
    count: number;
    revenue: number;
  }>;
};

export function ProductVariantsSection({
  sizes,
  colors,
  topCombinations,
}: ProductVariantsSectionProps) {
  return (
    <>
      <MetricsSection title="Статистика по размерам/цветам">
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm cursor-help">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Популярные размеры</CardTitle>
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                  </div>
                  <CardDescription className="text-xs">По количеству продаж</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sizes.slice(0, METRICS_CONSTANTS.TOP_SIZES_COLORS_COUNT).map((size) => (
                      <div
                        key={size.size}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">{size.size}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{size.count} шт</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatMoney(size.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed">
                Рейтинг размеров товаров по количеству продаж и выручке. Показывает, какие размеры
                наиболее популярны среди покупателей, что помогает оптимизировать складские запасы.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm cursor-help">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Популярные цвета</CardTitle>
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                  </div>
                  <CardDescription className="text-xs">По количеству продаж</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {colors.slice(0, METRICS_CONSTANTS.TOP_SIZES_COLORS_COUNT).map((color) => (
                      <div
                        key={color.color}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm font-medium">{color.color}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{color.count} шт</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatMoney(color.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed">
                Рейтинг цветов товаров по количеству продаж и выручке. Показывает цветовые
                предпочтения покупателей, что помогает при формировании ассортимента и планировании
                закупок.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </MetricsSection>

      {topCombinations.length > 0 && (
        <MetricsSection title="Топ комбинации размер-цвет" description="Самые популярные варианты">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm cursor-help">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">
                      Топ комбинации размер-цвет
                    </CardTitle>
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                  </div>
                  <CardDescription className="text-xs">Самые популярные варианты</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {topCombinations
                      .slice(0, METRICS_CONSTANTS.TOP_COMBINATIONS_COUNT)
                      .map((combo, index) => (
                        <div
                          key={`${combo.size}-${combo.color}`}
                          className="p-3 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{combo.size}</p>
                          <p className="text-xs text-muted-foreground">{combo.color}</p>
                          <p className="text-xs font-semibold mt-1">{combo.count} шт</p>
                          <p className="text-xs text-muted-foreground">
                            {formatMoney(combo.revenue)}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed">
                Топ-10 самых популярных комбинаций размер-цвет по количеству продаж и выручке.
                Помогает понять, какие конкретные варианты товаров пользуются наибольшим спросом,
                что важно для управления складскими запасами.
              </p>
            </TooltipContent>
          </Tooltip>
        </MetricsSection>
      )}
    </>
  );
}
