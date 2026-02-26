/**
 * Карточка отдельной метрики Web Vitals
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
import { Gauge, Info } from "lucide-react";
import { getMetricColor, getMetricBgColor, formatMetricValue } from "../utils";
import { METRIC_DESCRIPTIONS, METRIC_DETAILED_DESCRIPTIONS, PERCENTILE_EXPLANATION } from "../types";

interface MetricStats {
  count: number;
  avg: number;
  p95: number;
}

interface MetricCardProps {
  metricName: string;
  stats: MetricStats | undefined;
}

export function MetricCard({ metricName, stats }: MetricCardProps) {
  if (!stats) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardDescription className="text-xs font-medium">{metricName}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold text-muted-foreground">Нет данных</CardTitle>
        </CardContent>
      </Card>
    );
  }

  const value = stats.avg;
  const color = getMetricColor(metricName, value);
  const bgColor = getMetricBgColor(metricName, value);
  const description = METRIC_DESCRIPTIONS[metricName] || "";
  const detailedDescription = METRIC_DETAILED_DESCRIPTIONS[metricName] || "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={`rounded-2xl border shadow-sm ${bgColor} cursor-help`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <CardDescription className={`text-sm font-medium ${color}`}>
                  {metricName}
                </CardDescription>
                <Info className={`h-3.5 w-3.5 ${color} opacity-60`} />
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 leading-tight">
                  {description}
                </p>
              )}
            </div>
            <Gauge className={`h-5 w-5 ${color} shrink-0 ml-2`} />
          </CardHeader>
          <CardContent>
            <CardTitle className={`text-3xl font-bold ${color}`}>
              {formatMetricValue(metricName, value)}
            </CardTitle>
            <div className="mt-2 space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground cursor-help">
                    P95: {formatMetricValue(metricName, stats.p95)} · {stats.count} измерений
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs leading-relaxed">{PERCENTILE_EXPLANATION}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <p className="text-xs leading-relaxed font-medium mb-1">{metricName}</p>
        <p className="text-xs leading-relaxed">{detailedDescription}</p>
      </TooltipContent>
    </Tooltip>
  );
}
