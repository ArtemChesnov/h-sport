"use client";

/**
 * Компонент для отображения алертов о размере таблиц БД
 * Показывает предупреждения и рекомендации по решению проблем
 */

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Database, Info, Loader2, Trash2 } from "lucide-react";

interface TableAlert {
  tableName: string;
  severity: "warning" | "critical";
  type: "size" | "rows";
  currentValue: number;
  limit: number;
  message: string;
  recommendations: string[];
}

interface AlertsResponse {
  alerts: TableAlert[];
  stats: {
    counts: {
      apiMetrics: number;
      productViews: number;
      cartActions: number;
      favoriteActions: number;
      conversions: number;
      webVitals: number;
      total: number;
    };
    tableStats: Array<{
      tableName: string;
      rowCount: number;
      tableSize: string;
      tableSizeBytes: number;
      totalSize: string;
      totalSizeBytes: number;
    }>;
    totalSize: string;
    totalSizeBytes: number;
  };
  hasAlerts: boolean;
  criticalCount: number;
  warningCount: number;
}

async function fetchAlerts(): Promise<AlertsResponse> {
  const response = await fetch("/api/metrics/alerts");
  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }
  return response.json();
}

function formatValue(value: number, type: "size" | "rows"): string {
  if (type === "size") {
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
  return value.toLocaleString();
}

/**
 * Получает CSRF токен из cookie
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split("; csrf_token=");
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

async function runAutoCleanup(): Promise<{ success: boolean; message: string; results: unknown[] }> {
  const csrfToken = getCsrfToken();
  const response = await fetch("/api/metrics/cleanup-auto", {
    method: "POST",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to run auto cleanup");
  }
  return response.json();
}

export function DatabaseAlerts() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["database-alerts"],
    queryFn: fetchAlerts,
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });

  const cleanupMutation = useMutation({
    mutationFn: runAutoCleanup,
    onSuccess: () => {
      // Обновляем данные после очистки
      queryClient.invalidateQueries({ queryKey: ["database-alerts"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive">Ошибка загрузки алертов</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.hasAlerts) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/50 cursor-help">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base font-semibold">Статус БД в норме</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Все таблицы метрик в пределах нормальных значений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Общий размер:</span>
                  <span className="font-semibold">{data.stats.totalSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Всего записей:</span>
                  <span className="font-semibold">{data.stats.counts.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">Статус БД в норме</p>
          <p className="text-xs leading-relaxed">
            Все таблицы метрик находятся в пределах нормальных значений. Лимиты для алертов:
            предупреждение при 100 MB или 1M записей на таблицу, критическое при 500 MB или 5M записей.
            Общий лимит для всех таблиц: 2 GB.
          </p>
        </TooltipContent>
      </Tooltip>
      </TooltipProvider>
    );
  }

  const criticalAlerts = data.alerts.filter((a) => a.severity === "critical");
  const warningAlerts = data.alerts.filter((a) => a.severity === "warning");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Алерты размера таблиц</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.criticalCount > 0 && (
              <span className="text-destructive">
                {data.criticalCount} критических,{" "}
              </span>
            )}
            {data.warningCount} предупреждений
          </p>
        </div>
        {data.hasAlerts && (
          <Button
            onClick={() => {
              if (confirm("Выполнить автоматическую очистку старых данных? Данные старше 20 дней будут удалены.")) {
                cleanupMutation.mutate();
              }
            }}
            disabled={cleanupMutation.isPending}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {cleanupMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Очистка...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Автоматическая очистка
              </>
            )}
          </Button>
        )}
      </div>

      {cleanupMutation.isSuccess && (
        <Alert className="border-emerald-200/60 bg-emerald-50/50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-base font-semibold">Очистка выполнена</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {cleanupMutation.data.message}
            {cleanupMutation.data && typeof cleanupMutation.data === "object" && "totalDeleted" in cleanupMutation.data && typeof cleanupMutation.data.totalDeleted === "number" && cleanupMutation.data.totalDeleted > 0 && (
              <span className="block mt-1">
                Удалено записей: {cleanupMutation.data.totalDeleted.toLocaleString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {cleanupMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-base font-semibold">Ошибка очистки</AlertTitle>
          <AlertDescription className="mt-2 text-sm">
            {cleanupMutation.error instanceof Error
              ? cleanupMutation.error.message
              : "Произошла ошибка при выполнении очистки"}
          </AlertDescription>
        </Alert>
      )}

      {/* Критические алерты */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-4">
          {criticalAlerts.map((alert, index) => (
            <Alert
              key={`critical-${index}`}
              variant="destructive"
              className="border-destructive/50 bg-destructive/5"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-base font-semibold">{alert.message}</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Текущее значение:</span>{" "}
                  {formatValue(alert.currentValue, alert.type)} |{" "}
                  <span className="font-medium">Лимит:</span>{" "}
                  {formatValue(alert.limit, alert.type)}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Рекомендации:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {alert.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Предупреждения */}
      {warningAlerts.length > 0 && (
        <div className="space-y-4">
          {warningAlerts.map((alert, index) => (
            <Alert
              key={`warning-${index}`}
              className="border-amber-200/60 bg-amber-50/50"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-base font-semibold">{alert.message}</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Текущее значение:</span>{" "}
                  {formatValue(alert.currentValue, alert.type)} |{" "}
                  <span className="font-medium">Лимит:</span>{" "}
                  {formatValue(alert.limit, alert.type)}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Рекомендации:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {alert.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Общая статистика */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Статистика таблиц</CardTitle>
          <CardDescription className="text-xs">Размеры и количество записей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.stats.tableStats.map((stat) => {
              const hasAlert = data.alerts.some((a) => a.tableName === stat.tableName);
              return (
                <div
                  key={stat.tableName}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    hasAlert ? "border-amber-200/60 bg-amber-50/30" : "border-border/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stat.tableName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.rowCount.toLocaleString()} записей
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{stat.totalSize}</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.tableSize}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
