import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getMetricsSummary, clearOldMetricsFromDb } from "@/shared/lib/metrics";
import {
  clearOldEcommerceMetricsFromDb,
  clearOldSystemLogsFromDb,
} from "@/shared/lib/ecommerce-metrics";
import { NextRequest, NextResponse } from "next/server";

const AUTO_CLEANUP_LIMITS = {
  AUTO_CLEANUP_SIZE: 200 * 1024 * 1024,
  AUTO_CLEANUP_ROWS: 2_000_000,
  TOTAL_SIZE_LIMIT: 1.5 * 1024 * 1024 * 1024,
};

interface CleanupResult {
  tableName: string;
  cleaned: boolean;
  reason: string;
  deletedRows?: number;
  newSize?: string;
}

const postHandlerWithMetrics = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<unknown>> => {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const stats = await getMetricsSummary();
    const results: CleanupResult[] = [];
    let totalDeleted = 0;

    const tablesToClean: Array<{ name: string; reason: string }> = [];

    for (const tableStat of stats.tableStats) {
      let needsCleanup = false;
      let reason = "";

      if (tableStat.totalSizeBytes >= AUTO_CLEANUP_LIMITS.AUTO_CLEANUP_SIZE) {
        needsCleanup = true;
        reason = `Размер таблицы ${tableStat.totalSize} превышает лимит ${(AUTO_CLEANUP_LIMITS.AUTO_CLEANUP_SIZE / (1024 * 1024)).toFixed(0)} MB`;
      } else if (tableStat.rowCount >= AUTO_CLEANUP_LIMITS.AUTO_CLEANUP_ROWS) {
        needsCleanup = true;
        reason = `Количество записей ${tableStat.rowCount.toLocaleString()} превышает лимит ${AUTO_CLEANUP_LIMITS.AUTO_CLEANUP_ROWS.toLocaleString()}`;
      }

      if (needsCleanup) {
        tablesToClean.push({ name: tableStat.tableName, reason });
      }
    }

    if (stats.totalSizeBytes >= AUTO_CLEANUP_LIMITS.TOTAL_SIZE_LIMIT) {
      tablesToClean.push({
        name: "all",
        reason: `Общий размер ${stats.totalSize} превышает лимит ${(AUTO_CLEANUP_LIMITS.TOTAL_SIZE_LIMIT / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      });
    }

    for (const table of tablesToClean) {
      try {
        if (table.name === "ApiMetric" || table.name === "all") {
          await clearOldMetricsFromDb(20);
          results.push({
            tableName: "ApiMetric",
            cleaned: true,
            reason: table.reason,
          });
        }

        if (
          table.name === "ProductView" ||
          table.name === "CartAction" ||
          table.name === "FavoriteAction" ||
          table.name === "Conversion" ||
          table.name === "all"
        ) {
          await clearOldEcommerceMetricsFromDb(20);
          if (table.name !== "all") {
            results.push({
              tableName: table.name,
              cleaned: true,
              reason: table.reason,
            });
          } else {
            results.push({
              tableName: "E-commerce метрики (все)",
              cleaned: true,
              reason: table.reason,
            });
          }
        }

        if (
          table.name === "SecurityEvent" ||
          table.name === "WebhookLog" ||
          table.name === "ClientErrorLog" ||
          table.name === "SlowQuery" ||
          table.name === "ServerMetrics" ||
          table.name === "all"
        ) {
          await clearOldSystemLogsFromDb();
          results.push({
            tableName: table.name === "all" ? "System logs (все)" : table.name,
            cleaned: true,
            reason: table.reason,
          });
        }

        if (table.name === "WebVitalsMetric" || table.name === "all") {
          try {
            const { cleanOldWebVitals } =
              await import("@/shared/services/server/metrics/metrics-route.service");
            const deletedCount = await cleanOldWebVitals(20);

            results.push({
              tableName: "WebVitalsMetric",
              cleaned: true,
              reason: table.reason,
              deletedRows: deletedCount,
            });
            totalDeleted += deletedCount;
          } catch (error) {
            results.push({
              tableName: "WebVitalsMetric",
              cleaned: false,
              reason: `Ошибка при очистке: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
            });
          }
        }
      } catch (error) {
        results.push({
          tableName: table.name,
          cleaned: false,
          reason: `Ошибка при очистке: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }

    const updatedStats = await getMetricsSummary();

    return NextResponse.json(
      {
        success: true,
        results,
        totalDeleted,
        statsBefore: stats,
        statsAfter: updatedStats,
        message:
          results.length > 0
            ? `Очистка выполнена для ${results.filter((r) => r.cleaned).length} таблиц`
            : "Очистка не требовалась",
      },
      { status: 200 }
    );
  }
);

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandlerWithMetrics, request, "POST /api/metrics/cleanup-auto");
}
