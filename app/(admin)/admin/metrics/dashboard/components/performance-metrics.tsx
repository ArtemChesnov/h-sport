"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Activity, Clock, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useApiMetricsQuery } from "@/shared/hooks/admin/use-api-metrics-query";
import { useWebVitalsQuery } from "@/shared/hooks/admin/use-web-vitals-query";

interface ApiMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  requestsPerMinute: number;
  slowestEndpoints: Array<{
    endpoint: string;
    method: string;
    avgDuration: number;
    count: number;
  }>;
}

interface WebVitalsMetrics {
  period: {
    hours: number;
    from: string;
    to: string;
  };
  metrics: Array<{
    name: string;
    count: number;
    avg: number;
    p50: number;
    p75: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  }>;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function OverviewStats() {
  const { data: metrics, isLoading } = useApiMetricsQuery(60 * 60 * 1000); // 1 hour

  if (isLoading || !metrics) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const typedMetrics = metrics as ApiMetrics;

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">{typedMetrics.totalRequests}</div>
      <p className="text-xs text-muted-foreground">
        {typedMetrics.requestsPerMinute.toFixed(1)} req/min
      </p>
    </div>
  );
}

function TopMetrics() {
  const { data: metrics, isLoading } = useApiMetricsQuery(60 * 60 * 1000);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const typedMetrics = metrics as ApiMetrics;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Среднее время ответа</span>
        <Badge variant="outline">{formatDuration(typedMetrics.averageResponseTime)}</Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">95-й перцентиль</span>
        <Badge variant={typedMetrics.p95 > 2000 ? "destructive" : "default"}>
          {formatDuration(typedMetrics.p95)}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Уровень ошибок</span>
        <Badge variant={typedMetrics.errorRate > 0.05 ? "destructive" : "secondary"}>
          {(typedMetrics.errorRate * 100).toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
}

function FullView() {
  const { data: metrics, isLoading } = useApiMetricsQuery(60 * 60 * 1000);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Performance Metrics</CardTitle>
            <CardDescription>Загрузка метрик производительности...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedMetrics = metrics as ApiMetrics;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего запросов</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {typedMetrics.requestsPerMinute.toFixed(1)} req/min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(typedMetrics.averageResponseTime)}</div>
            <p className="text-xs text-muted-foreground">P50: {formatDuration(typedMetrics.p50)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">95-й перцентиль</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(typedMetrics.p95)}</div>
            <p className="text-xs text-muted-foreground">P99: {formatDuration(typedMetrics.p99)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уровень ошибок</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(typedMetrics.errorRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {typedMetrics.errorRate > 0.05 ? "Высокий уровень" : "Нормальный уровень"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Самые медленные эндпоинты</CardTitle>
          <CardDescription>Топ-10 эндпоинтов по среднему времени ответа</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typedMetrics.slowestEndpoints.slice(0, 10).map((endpoint, index) => (
              <div key={`${endpoint.method}-${endpoint.endpoint}`} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-sm">
                      {endpoint.method} {endpoint.endpoint}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {endpoint.count} запросов
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatDuration(endpoint.avgDuration)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WebVitalsSection />

      <BundleAnalysisInfo />
    </div>
  );
}

function BundleAnalysisInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📦 Bundle Size Trends
        </CardTitle>
        <CardDescription>
          Анализ размера JavaScript бандла
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">📊 Генерация отчета</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Для анализа размера бандла используйте команду:
            </p>
            <code className="bg-background px-2 py-1 rounded text-sm font-mono">
              npm run analyze
            </code>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">📁 Где найти отчет</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code className="bg-background px-1 rounded">.next/bundle-analyzer-report.html</code> - интерактивный отчет</li>
                <li>• <code className="bg-background px-1 rounded">.next/bundle-stats.json</code> - статистика в JSON</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">📚 Документация</h4>
              <p className="text-sm text-muted-foreground">
                Подробная инструкция в <code className="bg-background px-1 rounded">docs/ops/bundle-analysis.md</code>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WebVitalsSection() {
  const { data: webVitalsData, isLoading } = useWebVitalsQuery(24);

  if (isLoading || !webVitalsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Web Vitals</CardTitle>
          <CardDescription>Загрузка метрик производительности...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const typedWebVitals = webVitalsData as WebVitalsMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Web Vitals
        </CardTitle>
        <CardDescription>
          Метрики производительности за последние {typedWebVitals.period.hours} часов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {typedWebVitals.metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.name}</span>
                <Badge variant="outline">{metric.count} измерений</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">P75:</span>
                  <span className="font-mono">{metric.p75.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">P95:</span>
                  <span className="font-mono">{metric.p95.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-mono">{metric.avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const PerformanceMetrics = {
  OverviewStats,
  TopMetrics,
  FullView,
};
