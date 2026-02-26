/**
 * Страница метрик производительности в админке (/admin/metrics).
 */
import { Separator } from "@/shared/components/ui/separator";
import { Metadata } from "next";
import { UnifiedMetricsDashboard } from "./_components/unified-metrics-dashboard";

export const metadata: Metadata = {
  title: "Метрики производительности",
  description: "API метрики, Core Web Vitals и мониторинг размера таблиц БД",
};

export default function MetricsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Метрики производительности</h1>
        <p className="text-sm text-muted-foreground mt-1">
          API метрики, Core Web Vitals и мониторинг размера таблиц БД
        </p>
      </header>
      <Separator />
      <UnifiedMetricsDashboard />
    </div>
  );
}
