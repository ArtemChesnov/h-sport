"use client";

/**
 * Объединенный дашборд метрик производительности
 * Включает API метрики, Web Vitals и алерты БД
 */

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DatabaseAlerts } from "./database-alerts";

// Динамическая загрузка дашбордов для уменьшения initial bundle
// Графики (Recharts) загружаются только при открытии соответствующей вкладки
// Не указываем loading, так как компоненты сами имеют детальные скелетоны внутри
const MetricsDashboard = dynamic(() => import("./metrics-dashboard").then((mod) => ({ default: mod.MetricsDashboard })), {
  ssr: false,
});

const WebVitalsDashboard = dynamic(
  () => import("../web-vitals/_components/web-vitals-dashboard").then((mod) => ({ default: mod.WebVitalsDashboard })),
  {
    ssr: false,
  }
);

const SlowQueriesDashboard = dynamic(
  () => import("./slow-queries-dashboard").then((mod) => ({ default: mod.SlowQueriesDashboard })),
  {
    ssr: false,
  }
);

const ServerMetricsDashboard = dynamic(
  () => import("./server-metrics-dashboard").then((mod) => ({ default: mod.ServerMetricsDashboard })),
  {
    ssr: false,
  }
);

export function UnifiedMetricsDashboard() {
  return (
    <div className="space-y-6">
      {/* Алерты БД - показываем всегда сверху, если есть */}
      <DatabaseAlerts />

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="api">API Метрики</TabsTrigger>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="slow-queries">Медленные запросы</TabsTrigger>
          <TabsTrigger value="server">Сервер</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="mt-6">
          <MetricsDashboard />
        </TabsContent>

        <TabsContent value="web-vitals" className="mt-6">
          <WebVitalsDashboard />
        </TabsContent>

        <TabsContent value="slow-queries" className="mt-6">
          <SlowQueriesDashboard />
        </TabsContent>

        <TabsContent value="server" className="mt-6">
          <ServerMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
