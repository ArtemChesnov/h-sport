"use client";

/**
 * Компонент для отображения метрик сервера
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useServerMetrics } from "./hooks/use-server-metrics";
import { Server, MemoryStick, Cpu, Clock, AlertCircle, Info } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}д ${hours}ч`;
  }
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
}

export function ServerMetricsDashboard() {
  const { data: metrics, isLoading, error } = useServerMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive">Ошибка загрузки метрик сервера</p>
        </CardContent>
      </Card>
    );
  }

  const heapUsagePercent = metrics.heapTotal > 0 ? (metrics.heapUsed / metrics.heapTotal) * 100 : 0;
  const freeMemPercent = metrics.totalmem > 0 ? (metrics.freemem / metrics.totalmem) * 100 : 0;
  const heapTotalMB = metrics.heapTotal / (1024 * 1024);
  const isHeapCritical = heapUsagePercent > 80 && heapTotalMB > 200;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Heap память */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={`rounded-2xl border shadow-sm cursor-help ${
                  isHeapCritical
                    ? "bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50 border-red-200/60"
                    : "bg-gradient-to-br from-blue-50 via-blue-50/80 to-cyan-50 border-blue-200/60"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2">
                    <MemoryStick
                      className={`h-5 w-5 ${isHeapCritical ? "text-red-600" : "text-blue-600"}`}
                    />
                    <div className="flex items-center gap-1.5">
                      <CardDescription
                        className={`text-xs font-medium ${isHeapCritical ? "text-red-700" : "text-blue-700"}`}
                      >
                        Heap память
                      </CardDescription>
                      <Info
                        className={`h-3.5 w-3.5 ${isHeapCritical ? "text-red-600" : "text-blue-600"} opacity-60`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle
                    className={`text-3xl font-bold ${isHeapCritical ? "text-red-900" : "text-blue-900"}`}
                  >
                    {formatBytes(metrics.heapUsed)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    {heapUsagePercent.toFixed(1)}% от {formatBytes(metrics.heapTotal)}
                    {heapTotalMB < 300 && (
                      <span className="block mt-0.5 text-muted-foreground/80">
                        (текущий объём, лимит задаётся при запуске)
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed font-medium mb-1">Heap память</p>
              <p className="text-xs leading-relaxed">
                Текущий объём heap, выделенный V8 под объекты JavaScript. Лимит (например 1.4 GB)
                задаётся при запуске процесса (PM2: node_args). Красная плашка — только если
                выделено уже много (&gt;200 MB) и использование &gt;80%.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* RSS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-violet-50 border-indigo-200/60 cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-indigo-600" />
                    <div className="flex items-center gap-1.5">
                      <CardDescription className="text-xs font-medium text-indigo-700">
                        RSS (память)
                      </CardDescription>
                      <Info className="h-3.5 w-3.5 text-indigo-600 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl font-bold text-indigo-900">
                    {formatBytes(metrics.rss)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    Внешняя: {formatBytes(metrics.external)}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed font-medium mb-1">RSS (Resident Set Size)</p>
              <p className="text-xs leading-relaxed">
                Общая физическая память, используемая процессом. Включает heap память, код
                приложения и другие структуры данных. RSS показывает реальное потребление памяти
                процессом в системе.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* CPU */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-purple-50 via-purple-50/80 to-pink-50 border-purple-200/60 cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-600" />
                    <div className="flex items-center gap-1.5">
                      <CardDescription className="text-xs font-medium text-purple-700">
                        CPU
                      </CardDescription>
                      <Info className="h-3.5 w-3.5 text-purple-600 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl font-bold text-purple-900">
                    {metrics.cpuCount}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">Ядер процессора</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed font-medium mb-1">CPU</p>
              <p className="text-xs leading-relaxed">
                Количество ядер процессора на сервере. Используется для понимания возможностей
                сервера.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Uptime */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50 border-emerald-200/60 cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <div className="flex items-center gap-1.5">
                      <CardDescription className="text-xs font-medium text-emerald-700">
                        Uptime
                      </CardDescription>
                      <Info className="h-3.5 w-3.5 text-emerald-600 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl font-bold text-emerald-900">
                    {formatUptime(metrics.uptime)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">Время работы сервера</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-xs leading-relaxed font-medium mb-1">Uptime</p>
              <p className="text-xs leading-relaxed">
                Время работы Node.js процесса с момента последнего запуска. Показывает стабильность
                работы сервера.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Системная память */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-slate-600" />
              Системная память
            </CardTitle>
            <CardDescription className="text-xs">Общая информация о памяти системы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Свободно</span>
                  <span
                    className={`text-sm font-semibold ${freeMemPercent < 10 ? "text-red-600" : "text-slate-900"}`}
                  >
                    {formatBytes(metrics.freemem)} ({freeMemPercent.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Всего</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatBytes(metrics.totalmem)}
                  </span>
                </div>
              </div>
            </div>
            {freeMemPercent < 10 && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Критически мало свободной памяти
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Свободной памяти менее 10%. Рекомендуется проверить использование памяти на
                    сервере.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
