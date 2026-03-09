/**
 * Карточки с основными метриками дашборда
 * Обновленный дизайн в едином стиле
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui";
import { formatMoney } from "@/shared/lib/formatters";
import { DTO } from "@/shared/services";
import { CheckCircle2, DollarSign, Info, ShoppingBag, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  summary: DTO.AdminDashboardSummaryDto | undefined;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={`summary-skeleton-${i}`} className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { totalRevenue, totalOrders, averageCheck, paidOrders } = summary;

  return (
    <TooltipProvider>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50 border-emerald-200/60 shadow-emerald-100/20 cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <CardDescription className="text-xs font-medium text-emerald-700">
                    Выручка за период
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-emerald-600 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold text-emerald-900">
                  {formatMoney(totalRevenue)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">По всем активным заказам</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Общая сумма выручки за выбранный период. Учитываются заказы со статусами: оплачен,
              обрабатывается, отправлен, доставлен.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-blue-50 border-indigo-200/60 shadow-indigo-100/20 cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                  <CardDescription className="text-xs font-medium text-indigo-700">
                    Всего заказов
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-indigo-600 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold text-indigo-900">{totalOrders}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">За выбранный период</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Общее количество «живых» заказов за выбранный период. Учитываются заказы со статусами:
              оплачен, обрабатывается, отправлен, доставлен.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-violet-50 via-violet-50/80 to-purple-50 border-violet-200/60 shadow-violet-100/20 cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-violet-600" />
                  <CardDescription className="text-xs font-medium text-violet-700">
                    Оплачено заказов
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-violet-600 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold text-violet-900">{paidOrders}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Успешно оплаченные заказы</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Количество заказов, которые были успешно оплачены. Показывает количество завершенных
              транзакций.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50 border-amber-200/60 shadow-amber-100/20 cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <CardDescription className="text-xs font-medium text-amber-700">
                    Средний чек
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-amber-600 opacity-60" />
                </div>
                <CardTitle className="text-3xl font-bold text-amber-900">
                  {formatMoney(averageCheck)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">Средняя сумма заказа</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Средняя сумма одного заказа за выбранный период. Рассчитывается как общая выручка,
              разделенная на количество заказов.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
