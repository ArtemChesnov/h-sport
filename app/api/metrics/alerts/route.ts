/**
 * GET /api/metrics/alerts
 * Получить алерты о размере таблиц метрик
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { getMetricsSummary } from "@/shared/lib/metrics";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";

// Лимиты для алертов (в байтах)
const ALERT_LIMITS = {
  // Предупреждение при превышении 100 MB на таблицу
  WARNING_SIZE: 100 * 1024 * 1024, // 100 MB
  // Критическое предупреждение при превышении 500 MB на таблицу
  CRITICAL_SIZE: 500 * 1024 * 1024, // 500 MB
  // Предупреждение при превышении 1M записей
  WARNING_ROWS: 1_000_000,
  // Критическое предупреждение при превышении 5M записей
  CRITICAL_ROWS: 5_000_000,
  // Общий лимит размера всех таблиц метрик
  TOTAL_SIZE_LIMIT: 2 * 1024 * 1024 * 1024, // 2 GB
};

interface TableAlert {
  tableName: string;
  severity: "warning" | "critical";
  type: "size" | "rows";
  currentValue: number;
  limit: number;
  message: string;
  recommendations: string[];
}

export const GET = withMetricsAuto(async (
  request: NextRequest,
): Promise<NextResponse<unknown>> => {
  // Проверка прав администратора
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  const stats = await getMetricsSummary();
  const alerts: TableAlert[] = [];

  // Проверяем каждую таблицу
  for (const tableStat of stats.tableStats) {
    // Проверка размера таблицы
    if (tableStat.totalSizeBytes >= ALERT_LIMITS.CRITICAL_SIZE) {
      alerts.push({
        tableName: tableStat.tableName,
        severity: "critical",
        type: "size",
        currentValue: tableStat.totalSizeBytes,
        limit: ALERT_LIMITS.CRITICAL_SIZE,
        message: `Критический размер таблицы ${tableStat.tableName}: ${tableStat.totalSize}`,
        recommendations: [
          "Немедленно выполните очистку старых данных",
          "Рассмотрите возможность архивации данных старше 30 дней",
          "Проверьте настройки автоматической очистки метрик",
          "Рассмотрите возможность партиционирования таблицы",
        ],
      });
    } else if (tableStat.totalSizeBytes >= ALERT_LIMITS.WARNING_SIZE) {
      alerts.push({
        tableName: tableStat.tableName,
        severity: "warning",
        type: "size",
        currentValue: tableStat.totalSizeBytes,
        limit: ALERT_LIMITS.WARNING_SIZE,
        message: `Большой размер таблицы ${tableStat.tableName}: ${tableStat.totalSize}`,
        recommendations: [
          "Рекомендуется выполнить очистку старых данных",
          "Проверьте настройки автоматической очистки метрик",
          "Рассмотрите возможность уменьшения периода хранения",
        ],
      });
    }

    // Проверка количества записей
    if (tableStat.rowCount >= ALERT_LIMITS.CRITICAL_ROWS) {
      alerts.push({
        tableName: tableStat.tableName,
        severity: "critical",
        type: "rows",
        currentValue: tableStat.rowCount,
        limit: ALERT_LIMITS.CRITICAL_ROWS,
        message: `Критическое количество записей в таблице ${tableStat.tableName}: ${tableStat.rowCount.toLocaleString()}`,
        recommendations: [
          "Немедленно выполните очистку старых данных",
          "Рассмотрите возможность архивации данных старше 30 дней",
          "Проверьте настройки автоматической очистки метрик",
          "Рассмотрите возможность партиционирования таблицы",
        ],
      });
    } else if (tableStat.rowCount >= ALERT_LIMITS.WARNING_ROWS) {
      alerts.push({
        tableName: tableStat.tableName,
        severity: "warning",
        type: "rows",
        currentValue: tableStat.rowCount,
        limit: ALERT_LIMITS.WARNING_ROWS,
        message: `Большое количество записей в таблице ${tableStat.tableName}: ${tableStat.rowCount.toLocaleString()}`,
        recommendations: [
          "Рекомендуется выполнить очистку старых данных",
          "Проверьте настройки автоматической очистки метрик",
          "Рассмотрите возможность уменьшения периода хранения",
        ],
      });
    }
  }

  // Проверка общего размера всех таблиц
  if (stats.totalSizeBytes >= ALERT_LIMITS.TOTAL_SIZE_LIMIT) {
    alerts.push({
      tableName: "Все таблицы метрик",
      severity: "critical",
      type: "size",
      currentValue: stats.totalSizeBytes,
      limit: ALERT_LIMITS.TOTAL_SIZE_LIMIT,
      message: `Критический общий размер всех таблиц метрик: ${stats.totalSize}`,
      recommendations: [
        "Немедленно выполните очистку старых данных во всех таблицах",
        "Рассмотрите возможность архивации данных старше 30 дней",
        "Проверьте настройки автоматической очистки метрик",
        "Рассмотрите возможность уменьшения периода хранения для всех метрик",
        "Рассмотрите возможность использования внешнего хранилища для архивных данных",
      ],
    });
  }

  return NextResponse.json(
    {
      alerts,
      stats,
      hasAlerts: alerts.length > 0,
      criticalCount: alerts.filter((a) => a.severity === "critical").length,
      warningCount: alerts.filter((a) => a.severity === "warning").length,
    },
    { status: 200 },
  );
});
