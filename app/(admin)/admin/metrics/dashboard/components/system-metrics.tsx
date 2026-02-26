"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Database, Cpu, HardDrive, Clock } from "lucide-react";
import { useDBMetricsQuery } from "@/shared/hooks/admin/use-db-metrics-query";
import { useServerMetricsQuery } from "@/shared/hooks/admin/use-server-metrics-query";

interface ServerMetrics {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  cpuUser: number;
  cpuSystem: number;
  cpuCount: number;
  freemem: number;
  totalmem: number;
  uptime: number;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function HealthStatus() {
  // Для простоты используем статичный статус
  // В реальности можно добавить health check
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium">OK</span>
      </div>
      <p className="text-xs text-muted-foreground">Все системы работают</p>
    </div>
  );
}

function FullView() {
  const { data: metrics, isLoading } = useServerMetricsQuery();

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Загрузка системных метрик...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedMetrics = metrics as ServerMetrics;
  const heapUsagePercent = (typedMetrics.heapUsed / typedMetrics.heapTotal) * 100;
  const memoryUsagePercent = ((typedMetrics.totalmem - typedMetrics.freemem) / typedMetrics.totalmem) * 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heap Memory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heapUsagePercent.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(typedMetrics.heapUsed)} / {formatBytes(typedMetrics.heapTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Memory</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryUsagePercent.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(typedMetrics.totalmem - typedMetrics.freemem)} / {formatBytes(typedMetrics.totalmem)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Cores</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedMetrics.cpuCount}</div>
            <p className="text-xs text-muted-foreground">
              Доступно ядер
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(typedMetrics.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Время работы
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Детальная информация</CardTitle>
          <CardDescription>Подробные метрики сервера</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Memory Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Heap Used:</span>
                  <span className="text-sm font-mono">{formatBytes(typedMetrics.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Heap Total:</span>
                  <span className="text-sm font-mono">{formatBytes(typedMetrics.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">RSS:</span>
                  <span className="text-sm font-mono">{formatBytes(typedMetrics.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">External:</span>
                  <span className="text-sm font-mono">{formatBytes(typedMetrics.external)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Free Memory:</span>
                  <span className="text-sm font-mono">{formatBytes(typedMetrics.freemem)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">CPU Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">User CPU:</span>
                  <span className="text-sm font-mono">{Math.round(typedMetrics.cpuUser / 1000)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">System CPU:</span>
                  <span className="text-sm font-mono">{Math.round(typedMetrics.cpuSystem / 1000)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CPU Cores:</span>
                  <span className="text-sm font-mono">{typedMetrics.cpuCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime:</span>
                  <span className="text-sm font-mono">{formatUptime(typedMetrics.uptime)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DatabaseMetricsSection />
    </div>
  );
}

function DatabaseMetricsSection() {
  const { data: dbMetrics, isLoading } = useDBMetricsQuery(24);

  if (isLoading || !dbMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Metrics</CardTitle>
          <CardDescription>Загрузка метрик базы данных...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Metrics</CardTitle>
        <CardDescription>
          Метрики базы данных за последние {dbMetrics.period.hours} часов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Slow Queries</span>
              <Badge variant="outline">{dbMetrics.slowQueries.total}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Порог: {dbMetrics.threshold.slowQueryMs}ms
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Duration</span>
              <span className="text-sm font-mono">{dbMetrics.slowQueries.avgDuration}ms</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P95 Duration</span>
              <span className="text-sm font-mono">{dbMetrics.slowQueries.p95Duration}ms</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">P99 Duration</span>
              <span className="text-sm font-mono">{dbMetrics.slowQueries.p99Duration}ms</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Max Duration</span>
              <span className="text-sm font-mono">{dbMetrics.slowQueries.maxDuration}ms</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Connection Pool</span>
              <span className="text-sm font-mono">{dbMetrics.connectionPool.provider}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {dbMetrics.connectionPool.note}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-3">Топ медленных запросов</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {dbMetrics.topSlowQueries.slice(0, 5).map((query, index) => (
                <div key={index} className="border rounded p-3 bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                    <span className="text-sm font-mono">{query.duration}ms</span>
                  </div>
                  <div className="text-xs font-mono bg-background p-2 rounded text-muted-foreground mb-2">
                    {query.query.length > 100 ? query.query.substring(0, 100) + "..." : query.query}
                  </div>
                  {query.endpoint && (
                    <div className="text-xs text-muted-foreground">
                      Endpoint: {query.endpoint}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(query.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Распределение по эндпоинтам</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {dbMetrics.byEndpoint.map((endpoint, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="text-sm font-medium truncate max-w-32">
                      {endpoint.endpoint}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{endpoint.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {endpoint.avgDuration}ms avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const SystemMetrics = {
  HealthStatus,
  FullView,
};
