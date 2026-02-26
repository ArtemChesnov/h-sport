"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertTriangle, AlertCircle, CheckCircle, ExternalLink, History } from "lucide-react";
import { useAlertsQuery } from "@/shared/hooks/admin/use-alerts-query";
import { useIncidentsInfiniteQuery, useUpdateIncidentMutation } from "@/shared/hooks/admin/use-incidents-query";

interface Incident {
  id: number;
  fingerprint: string;
  source: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  details?: Record<string, unknown>;
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
}

interface Alert {
  tableName: string;
  severity: "warning" | "critical";
  type: "size" | "rows";
  currentValue: number;
  limit: number;
  message: string;
  recommendations: string[];
}

interface AlertsData {
  alerts: Alert[];
  stats: {
    tableStats: Array<{
      tableName: string;
      totalSizeBytes: number;
      totalSize: string;
      rowCount: number;
    }>;
    totalSizeBytes: number;
    totalSize: string;
    totalRows: number;
  };
  hasAlerts: boolean;
  criticalCount: number;
  warningCount: number;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function ActiveAlertsCount() {
  const { data: alertsData, isLoading } = useAlertsQuery();

  if (isLoading || !alertsData) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const typedAlerts = alertsData as AlertsData;

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">{typedAlerts.criticalCount + typedAlerts.warningCount}</div>
      <p className="text-xs text-muted-foreground">
        {typedAlerts.criticalCount} критических, {typedAlerts.warningCount} предупреждений
      </p>
    </div>
  );
}

function RecentAlerts() {
  const { data: alertsData, isLoading } = useAlertsQuery();

  if (isLoading || !alertsData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const typedAlerts = alertsData as AlertsData;

  if (typedAlerts.alerts.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Нет активных алертов</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {typedAlerts.alerts.slice(0, 5).map((alert, index) => (
        <div key={`${alert.tableName}-${alert.type}-${index}`} className="flex items-start space-x-3">
          <div className="mt-0.5">
            {alert.severity === 'critical' ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium truncate">{alert.tableName}</p>
              <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                {alert.severity === 'critical' ? 'Критично' : 'Предупреждение'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
            {alert.type === 'size' && (
              <p className="text-xs text-muted-foreground">
                Текущий: {formatBytes(alert.currentValue)} | Лимит: {formatBytes(alert.limit)}
              </p>
            )}
            {alert.type === 'rows' && (
              <p className="text-xs text-muted-foreground">
                Текущий: {alert.currentValue.toLocaleString()} | Лимит: {alert.limit.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}

      {typedAlerts.alerts.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3 w-3 mr-1" />
            Посмотреть все ({typedAlerts.alerts.length})
          </Button>
        </div>
      )}
    </div>
  );
}

function FullView() {
  const { data: alertsData, isLoading } = useAlertsQuery();

  if (isLoading || !alertsData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Incidents</CardTitle>
            <CardDescription>Загрузка алертов...</CardDescription>
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

  const typedAlerts = alertsData as AlertsData;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Критические алерты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedAlerts.criticalCount}</div>
            <p className="text-xs text-muted-foreground">Требуют внимания</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Предупреждения</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedAlerts.warningCount}</div>
            <p className="text-xs text-muted-foreground">Рекомендуется проверить</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус</CardTitle>
            <CheckCircle className={`h-4 w-4 ${typedAlerts.hasAlerts ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typedAlerts.hasAlerts ? 'Имеются проблемы' : 'Все OK'}
            </div>
            <p className="text-xs text-muted-foreground">
              {typedAlerts.alerts.length} активных алертов
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все активные алерты</CardTitle>
          <CardDescription>Текущие проблемы системы, требующие внимания</CardDescription>
        </CardHeader>
        <CardContent>
          {typedAlerts.alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Все системы в норме</h3>
              <p className="text-sm text-muted-foreground">
                Нет активных алертов. Все метрики в допустимых пределах.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {typedAlerts.alerts.map((alert, index) => (
                <div key={`${alert.tableName}-${alert.type}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <h4 className="font-medium">{alert.tableName}</h4>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity === 'critical' ? 'Критично' : 'Предупреждение'}
                    </Badge>
                  </div>

                  <p className="text-sm mb-3">{alert.message}</p>

                  {alert.type === 'size' && (
                    <div className="bg-muted p-3 rounded mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Текущий размер:</span>
                        <span className="font-mono">{formatBytes(alert.currentValue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Лимит:</span>
                        <span className="font-mono">{formatBytes(alert.limit)}</span>
                      </div>
                    </div>
                  )}

                  {alert.type === 'rows' && (
                    <div className="bg-muted p-3 rounded mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Текущее количество:</span>
                        <span className="font-mono">{alert.currentValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Лимит:</span>
                        <span className="font-mono">{alert.limit.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-medium mb-2">Рекомендации:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {alert.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IncidentsHistoryTable />
    </div>
  );
}

function IncidentsHistoryTable() {
  const {
    data: incidentsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIncidentsInfiniteQuery({ limit: 20 });

  const updateIncidentMutation = useUpdateIncidentMutation();

  const handleResolveIncident = (id: number) => {
    updateIncidentMutation.mutate({ id, status: "RESOLVED" });
  };

  const handleActivateIncident = (id: number) => {
    updateIncidentMutation.mutate({ id, status: "ACTIVE" });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Собираем все инциденты из всех страниц
  const allIncidents = incidentsData?.pages.flatMap((page: { incidents: Incident[] }) => page.incidents) || [];

  if (isLoading || !incidentsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            История инцидентов
          </CardTitle>
          <CardDescription>Загрузка истории инцидентов...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          История инцидентов
        </CardTitle>
        <CardDescription>
          Хронология всех инцидентов системы ({(incidentsData?.pages[0] as { pagination?: { total: number } })?.pagination?.total || 0} всего)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allIncidents.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">История пуста</h3>
            <p className="text-sm text-muted-foreground">
              Пока не было зарегистрировано ни одного инцидента.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {incident.severity === 'CRITICAL' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {incident.severity === 'WARNING' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {incident.severity === 'INFO' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    <h4 className="font-medium">{incident.title}</h4>
                    <Badge variant={
                      incident.severity === 'CRITICAL' ? 'destructive' :
                      incident.severity === 'WARNING' ? 'secondary' : 'outline'
                    }>
                      {incident.severity}
                    </Badge>
                    <Badge variant={incident.status === 'ACTIVE' ? 'destructive' : 'secondary'}>
                      {incident.status === 'ACTIVE' ? 'АКТИВЕН' : 'РАЗРЕШЕН'}
                    </Badge>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{new Date(incident.createdAt).toLocaleString()}</div>
                    {incident.resolvedAt && (
                      <div>Разрешено: {new Date(incident.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <p className="text-sm mb-2">{incident.message}</p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Источник: {incident.source} • Fingerprint: {incident.fingerprint}
                  </div>

                  <div className="flex space-x-2">
                    {incident.status === 'ACTIVE' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveIncident(incident.id)}
                        disabled={updateIncidentMutation.isPending}
                      >
                        Разрешить
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivateIncident(incident.id)}
                        disabled={updateIncidentMutation.isPending}
                      >
                        Активировать
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Загрузка..." : "Загрузить ещё"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const AlertsIncidents = {
  ActiveAlertsCount,
  RecentAlerts,
  FullView,
};
