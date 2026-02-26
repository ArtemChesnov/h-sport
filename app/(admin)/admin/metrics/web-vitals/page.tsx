/**
 * Страница Web Vitals метрик в админке
 */

import { Metadata } from "next";
import { WebVitalsDashboard } from "./_components/web-vitals-dashboard";
import { Separator } from "@/shared/components/ui/separator";

export const metadata: Metadata = {
  title: "Web Vitals",
  description: "Core Web Vitals метрики производительности",
};

export default function WebVitalsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Web Vitals</h1>
        <p className="text-sm text-muted-foreground mt-1">Core Web Vitals метрики производительности</p>
      </header>

      <Separator />

      <WebVitalsDashboard />
    </div>
  );
}
