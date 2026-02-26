/**
 * Карточка Pass Rate — процент метрик в хорошем диапазоне
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
import { TrendingUp, Info } from "lucide-react";
import { WEB_VITALS_THRESHOLDS, CORE_METRICS } from "../types";
import type { WebVitalsData } from "../types";

interface PassRateCardProps {
  statsByType: WebVitalsData["statsByType"];
}

export function PassRateCard({ statsByType }: PassRateCardProps) {
  // Вычисляем Pass Rate
  let passRate = 0;
  let totalMetrics = 0;

  for (const metricName of CORE_METRICS) {
    const stats = statsByType[metricName];
    if (!stats) continue;

    const threshold = WEB_VITALS_THRESHOLDS[metricName];
    if (threshold && stats.avg <= threshold.good) {
      passRate++;
    }
    totalMetrics++;
  }

  const passRatePercent = totalMetrics > 0 ? Math.round((passRate / totalMetrics) * 100) : 0;

  const bgClass = passRatePercent >= 80
    ? "bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50 border-emerald-200/60 shadow-emerald-100/20"
    : passRatePercent >= 60
      ? "bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50 border-amber-200/60 shadow-amber-100/20"
      : "bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50 border-red-200/60 shadow-red-100/20";

  const textColor = passRatePercent >= 80
    ? "text-emerald-700"
    : passRatePercent >= 60
      ? "text-amber-700"
      : "text-red-700";

  const iconColor = passRatePercent >= 80
    ? "text-emerald-600"
    : passRatePercent >= 60
      ? "text-amber-600"
      : "text-red-600";

  const titleColor = passRatePercent >= 80
    ? "text-emerald-900"
    : passRatePercent >= 60
      ? "text-amber-900"
      : "text-red-900";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={`rounded-2xl border shadow-sm cursor-help ${bgClass}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <CardDescription className={`text-sm font-medium ${textColor}`}>
                  Pass Rate
                </CardDescription>
                <Info className={`h-3.5 w-3.5 ${iconColor} opacity-60`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                Процент метрик в хорошем диапазоне
              </p>
            </div>
            <TrendingUp className={`h-5 w-5 ${iconColor} shrink-0 ml-2`} />
          </CardHeader>
          <CardContent>
            <CardTitle className={`text-3xl font-bold ${titleColor}`}>
              {passRatePercent}%
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-2">
              {passRate} из {totalMetrics} метрик в норме
            </p>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <p className="text-xs leading-relaxed font-medium mb-1">Pass Rate</p>
        <p className="text-xs leading-relaxed">
          Показывает процент метрик Web Vitals, которые находятся в &ldquo;хорошем&rdquo; диапазоне согласно рекомендациям Google.
          Рассчитывается на основе пороговых значений для каждой метрики (LCP ≤2.5с, INP ≤200мс, CLS ≤0.1, FCP ≤1.8с, TTFB ≤800мс).
          Цель: достичь 80%+ для оптимального пользовательского опыта.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
