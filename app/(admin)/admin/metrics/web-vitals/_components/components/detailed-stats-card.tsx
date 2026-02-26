/**
 * Карточка с детальной статистикой Web Vitals
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { TrendingUp, Info } from "lucide-react";
import { formatMetricValue } from "../utils";

interface MetricStats {
  count: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

interface DetailedStatsCardProps {
  statsEntries: Array<[string, MetricStats]>;
}

export function DetailedStatsCard({ statsEntries }: DetailedStatsCardProps) {
  if (statsEntries.length === 0) return null;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Детальная статистика</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statsEntries.map(([name, stats]) => (
            <div key={name} className="p-4 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{name}</h4>
                <span className="text-xs text-muted-foreground">{stats.count} измерений</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Среднее</div>
                  <div className="text-sm font-semibold">
                    {formatMetricValue(name, stats.avg)}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        P50
                        <Info className="h-3 w-3 opacity-60" />
                      </div>
                      <div className="text-sm font-semibold">
                        {formatMetricValue(name, stats.p50)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Медиана: 50% измерений лучше этого значения</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        P95
                        <Info className="h-3 w-3 opacity-60" />
                      </div>
                      <div className="text-sm font-semibold">
                        {formatMetricValue(name, stats.p95)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">95% измерений лучше этого значения (показывает типичные &ldquo;худшие&rdquo; случаи)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        P99
                        <Info className="h-3 w-3 opacity-60" />
                      </div>
                      <div className="text-sm font-semibold">
                        {formatMetricValue(name, stats.p99)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">99% измерений лучше этого значения (показывает экстремальные случаи)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
