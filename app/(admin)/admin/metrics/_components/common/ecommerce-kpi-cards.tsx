/**
 * Компонент карточек KPI для e-commerce метрик
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import { Eye, ShoppingCart, TrendingUp, Heart, Info } from "lucide-react";

type EcommerceKpiCardsProps = {
  totals: {
    totalViews: number;
    totalCartAdds: number;
    totalViewToCart: number;
    totalCartToOrder: number;
    viewToCartRate: string;
    cartToOrderRate: string;
  };
};

export function EcommerceKpiCards({ totals }: EcommerceKpiCardsProps) {
  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-blue-50 via-blue-50/80 to-cyan-50 border-blue-200/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-blue-900">Просмотры товаров</CardTitle>
                    <Info className="h-3.5 w-3.5 text-blue-600 opacity-60" />
                  </div>
                  <div className="h-4" />
                </div>
                <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{totals.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">За выбранный период</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Общее количество просмотров страниц товаров за выбранный период. Показывает активность пользователей и интерес к товарам.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-purple-50 via-purple-50/80 to-pink-50 border-purple-200/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-purple-900">Добавления в корзину</CardTitle>
                    <Info className="h-3.5 w-3.5 text-purple-600 opacity-60" />
                  </div>
                  <div className="h-4" />
                </div>
                <ShoppingCart className="h-5 w-5 text-purple-600 mt-0.5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{totals.totalCartAdds.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">За выбранный период</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Количество добавлений товаров в корзину за период. Показывает намерение пользователей совершить покупку.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50 border-emerald-200/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-emerald-900">Конверсия</CardTitle>
                    <Info className="h-3.5 w-3.5 text-emerald-600 opacity-60" />
                  </div>
                  <CardDescription className="text-xs text-emerald-700/80 mt-0.5">Просмотр → Корзина</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{totals.viewToCartRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.totalViewToCart.toLocaleString()} из {totals.totalViews.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Процент пользователей, которые добавили товар в корзину после просмотра. Показывает эффективность привлечения покупателей.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50 border-orange-200/60">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-orange-900">Конверсия</CardTitle>
                    <Info className="h-3.5 w-3.5 text-orange-600 opacity-60" />
                  </div>
                  <CardDescription className="text-xs text-orange-700/80 mt-0.5">Корзина → Заказ</CardDescription>
                </div>
                <Heart className="h-5 w-5 text-orange-600 mt-0.5" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{totals.cartToOrderRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.totalCartToOrder.toLocaleString()} из {totals.totalCartAdds.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Процент пользователей, которые оформили заказ после добавления товара в корзину. Показывает эффективность процесса оформления заказа.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
