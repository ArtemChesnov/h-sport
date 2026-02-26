/**
 * Карточки с основными метриками API
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
} from "@/shared/components/ui/tooltip";
import {
  Activity,
  AlertCircle,
  Clock,
  Zap,
  Info,
} from "lucide-react";
import { ComparisonIndicator } from "./comparison-indicator";
import type { MetricsData } from "../types";
import { PERCENTILE_EXPLANATION } from "../types";

interface MetricsSummaryCardsProps {
  metrics: MetricsData;
}

export function MetricsSummaryCards({ metrics }: MetricsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Всего запросов */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-slate-50 via-slate-50/80 to-zinc-50 border-slate-200/60 shadow-slate-100/20 cursor-help">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-600" />
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-medium text-slate-700">
                    Всего запросов
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-slate-600 opacity-60" />
                </div>
              </div>
              <ComparisonIndicator current={metrics.totalRequests} previous={metrics.previousPeriod?.totalRequests} />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {metrics.totalRequests.toLocaleString()}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.requestsPerMinute} запросов/мин · {metrics.requestsPerSecond || 0} RPS
              </p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">Всего запросов</p>
          <p className="text-xs leading-relaxed">
            Общее количество HTTP запросов к API за выбранный период. Включает все типы запросов (GET, POST, PUT, DELETE и т.д.).
            RPS (Requests Per Second) показывает среднюю нагрузку на сервер в запросах в секунду.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Среднее время ответа */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-cyan-50 via-cyan-50/80 to-sky-50 border-cyan-200/60 shadow-cyan-100/20 cursor-help">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-600" />
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-medium text-cyan-700">
                    Среднее время ответа
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-cyan-600 opacity-60" />
                </div>
              </div>
              <ComparisonIndicator
                current={metrics.averageResponseTime}
                previous={metrics.previousPeriod?.averageResponseTime}
                inverted={true}
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl font-bold text-cyan-900">
                {metrics.averageResponseTime}ms
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground mt-2 cursor-help">
                    P95: {metrics.p95}ms · P99: {metrics.p99}ms
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs leading-relaxed">{PERCENTILE_EXPLANATION}</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">Среднее время ответа</p>
          <p className="text-xs leading-relaxed">
            Среднее время обработки запроса от получения до отправки ответа. Включает время выполнения логики, запросов к БД и формирования ответа.
            P95 и P99 показывают перцентили для понимания реального опыта пользователей.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Процент ошибок */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={`rounded-2xl border shadow-sm cursor-help ${
            metrics.errorRate > 5
              ? "bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50 border-red-200/60 shadow-red-100/20"
              : "bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50 border-emerald-200/60 shadow-emerald-100/20"
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className={`h-5 w-5 ${metrics.errorRate > 5 ? "text-red-600" : "text-emerald-600"}`} />
                <div className="flex items-center gap-1.5">
                  <CardDescription className={`text-xs font-medium ${metrics.errorRate > 5 ? "text-red-700" : "text-emerald-700"}`}>
                    Процент ошибок
                  </CardDescription>
                  <Info className={`h-3.5 w-3.5 ${metrics.errorRate > 5 ? "text-red-600" : "text-emerald-600"} opacity-60`} />
                </div>
              </div>
              <ComparisonIndicator
                current={metrics.errorRate}
                previous={metrics.previousPeriod?.errorRate}
                inverted={true}
              />
            </CardHeader>
            <CardContent>
              <CardTitle className={`text-3xl font-bold ${metrics.errorRate > 5 ? "text-red-900" : "text-emerald-900"}`}>
                {metrics.errorRate.toFixed(2)}%
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                {Object.entries(metrics.statusCodes)
                  .filter(([code]) => parseInt(code) >= 400)
                  .reduce((sum, [, count]) => sum + count, 0)} {Object.entries(metrics.statusCodes)
                  .filter(([code]) => parseInt(code) >= 400)
                  .reduce((sum, [, count]) => sum + count, 0) === 1 ? "ошибка" : "ошибок"}
              </p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">Процент ошибок</p>
          <p className="text-xs leading-relaxed">
            Процент запросов, которые вернули HTTP статус код 400 и выше (ошибки клиента и сервера).
            Включает ошибки валидации (400), авторизации (401, 403), не найдено (404), ошибки сервера (500+) и т.д.
            Цель: поддерживать процент ошибок ниже 5% для стабильной работы API.
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Производительность (перцентили) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-violet-50 border-indigo-200/60 shadow-indigo-100/20 cursor-help">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-medium text-indigo-700">
                    Производительность
                  </CardDescription>
                  <Info className="h-3.5 w-3.5 text-indigo-600 opacity-60" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between text-sm cursor-help">
                      <span className="text-muted-foreground">P50:</span>
                      <span className="font-semibold text-indigo-900">{metrics.p50}ms</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Медиана: 50% запросов быстрее этого значения</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between text-sm cursor-help">
                      <span className="text-muted-foreground">P95:</span>
                      <span className="font-semibold text-indigo-900">{metrics.p95}ms</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">95% запросов быстрее этого значения (показывает типичные &ldquo;медленные&rdquo; запросы)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between text-sm cursor-help">
                      <span className="text-muted-foreground">P99:</span>
                      <span className="font-semibold text-indigo-900">{metrics.p99}ms</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">99% запросов быстрее этого значения (показывает экстремально медленные запросы)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">Производительность (Перцентили)</p>
          <p className="text-xs leading-relaxed">
            Перцентили времени ответа показывают распределение производительности запросов.
            P50 (медиана) показывает типичное время ответа, P95 и P99 показывают худшие случаи.
            Важно отслеживать P95 и P99, так как они показывают реальный опыт пользователей, который может быть хуже среднего значения.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
