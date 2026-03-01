"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Activity, Database, AlertTriangle, Clock, ShoppingCart } from "lucide-react";

// Импортируем компоненты секций
import { PerformanceMetrics } from "./performance-metrics";
import { BusinessMetrics } from "./business-metrics";
import { SystemMetrics } from "./system-metrics";
import { AlertsIncidents } from "./alerts-incidents";

export function DashboardContent() {
  const [lastUpdate, setLastUpdate] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мониторинг</h1>
          <p className="text-muted-foreground">Дашборд производительности и бизнеса H-Sport</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Обновлено: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
          <TabsTrigger value="business">Бизнес</TabsTrigger>
          <TabsTrigger value="system">Система</TabsTrigger>
          <TabsTrigger value="alerts">Алерты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <PerformanceMetrics.OverviewStats />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заказы сегодня</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <BusinessMetrics.OrdersToday />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Система</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <SystemMetrics.HealthStatus />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные алерты</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <AlertsIncidents.ActiveAlertsCount />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Последние алерты</CardTitle>
                <CardDescription>Критические события системы</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsIncidents.RecentAlerts />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ метрик</CardTitle>
                <CardDescription>Ключевые показатели производительности</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics.TopMetrics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics.FullView />
        </TabsContent>

        <TabsContent value="business">
          <BusinessMetrics.FullView />
        </TabsContent>

        <TabsContent value="system">
          <SystemMetrics.FullView />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsIncidents.FullView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
