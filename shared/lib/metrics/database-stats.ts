/**
 * Утилиты для мониторинга размера таблиц и статистики БД
 */

interface TableStats {
  tableName: string;
  rowCount: number;
  tableSize: string;
  tableSizeBytes: number;
  indexSize: string;
  indexSizeBytes: number;
  totalSize: string;
  totalSizeBytes: number;
}

export async function getMetricsTableStats(): Promise<TableStats[]> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");

    const result = await prisma.$queryRaw<Array<{
      table_name: string;
      row_count: bigint;
      table_size: bigint;
      index_size: bigint;
      total_size: bigint;
    }>>`
      SELECT
        c.relname AS table_name,
        GREATEST(0, COALESCE(c.reltuples::bigint, 0)) AS row_count,
        GREATEST(0, COALESCE(pg_total_relation_size(c.oid), 0)) AS total_size,
        GREATEST(0, COALESCE(pg_relation_size(c.oid), 0)) AS table_size,
        GREATEST(0, COALESCE(pg_total_relation_size(c.oid) - pg_relation_size(c.oid), 0)) AS index_size
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname IN ('ApiMetric', 'ProductView', 'CartAction', 'FavoriteAction', 'Conversion', 'WebVitalsMetric')
      ORDER BY total_size DESC;
    `;

    if (!result || result.length === 0) {
      const { logger } = await import("../logger");
      logger.warn("No table stats found. Tables may not exist or have different names.");
      return [];
    }

    return result.map((row) => {
      const tableSizeBytes = Number(row.table_size) || 0;
      const indexSizeBytes = Number(row.index_size) || 0;
      const totalSizeBytes = Number(row.total_size) || 0;
      const rowCount = Number(row.row_count) || 0;

      return {
        tableName: row.table_name,
        rowCount,
        tableSize: formatBytes(tableSizeBytes),
        tableSizeBytes,
        indexSize: formatBytes(indexSizeBytes),
        indexSizeBytes,
        totalSize: formatBytes(totalSizeBytes),
        totalSizeBytes,
      };
    });
  } catch (error) {
    const { logger } = await import("../logger");
    logger.error("Error fetching table stats", error);
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export async function getMetricsSummary() {
  try {
    const { prisma } = await import("@/prisma/prisma-client");

    const [apiMetricsCount, productViewsCount, cartActionsCount, favoriteActionsCount, conversionsCount, webVitalsCount] =
      await Promise.all([
        prisma.apiMetric.count(),
        prisma.productView.count(),
        prisma.cartAction.count(),
        prisma.favoriteAction.count(),
        prisma.conversion.count(),
        prisma.webVitalsMetric.count(),
      ]);

    const tableStats = await getMetricsTableStats();

    if (tableStats.length === 0) {
      const { logger } = await import("../logger");
      logger.warn("Table stats are empty, trying alternative method");

      const totalRecords = apiMetricsCount + productViewsCount + cartActionsCount + favoriteActionsCount + conversionsCount + webVitalsCount;
      const estimatedSize = totalRecords * 200;

      return {
        counts: {
          apiMetrics: apiMetricsCount,
          productViews: productViewsCount,
          cartActions: cartActionsCount,
          favoriteActions: favoriteActionsCount,
          conversions: conversionsCount,
          webVitals: webVitalsCount,
          total: totalRecords,
        },
        tableStats: [],
        totalSize: formatBytes(estimatedSize),
        totalSizeBytes: estimatedSize,
      };
    }

    const enhancedTableStats = tableStats.map((stat) => {
      let actualRowCount = stat.rowCount;

      const tableNameMap: Record<string, number> = {
        'ApiMetric': apiMetricsCount,
        'ProductView': productViewsCount,
        'CartAction': cartActionsCount,
        'FavoriteAction': favoriteActionsCount,
        'Conversion': conversionsCount,
        'WebVitalsMetric': webVitalsCount,
      };

      const realCount = tableNameMap[stat.tableName] || 0;
      if (realCount > 0 && (stat.rowCount === 0 || Math.abs(stat.rowCount - realCount) > realCount * 0.5)) {
        actualRowCount = realCount;
      }

      return {
        ...stat,
        rowCount: actualRowCount,
      };
    });

    const totalSize = enhancedTableStats.reduce((sum, stat) => sum + stat.totalSizeBytes, 0);

    return {
      counts: {
        apiMetrics: apiMetricsCount,
        productViews: productViewsCount,
        cartActions: cartActionsCount,
        favoriteActions: favoriteActionsCount,
        conversions: conversionsCount,
        webVitals: webVitalsCount,
        total: apiMetricsCount + productViewsCount + cartActionsCount + favoriteActionsCount + conversionsCount + webVitalsCount,
      },
      tableStats: enhancedTableStats,
      totalSize: formatBytes(totalSize),
      totalSizeBytes: totalSize,
    };
  } catch (error) {
    const { logger } = await import("../logger");
    logger.error("Error in getMetricsSummary", error);
    return {
      counts: {
        apiMetrics: 0,
        productViews: 0,
        cartActions: 0,
        favoriteActions: 0,
        conversions: 0,
        webVitals: 0,
        total: 0,
      },
      tableStats: [],
      totalSize: "0 B",
      totalSizeBytes: 0,
    };
  }
}
