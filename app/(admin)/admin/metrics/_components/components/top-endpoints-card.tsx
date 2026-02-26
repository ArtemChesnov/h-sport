/**
 * Карточка с топом популярных endpoints
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Server } from "lucide-react";

interface TopEndpointsCardProps {
  requestsPerEndpoint: Record<string, number>;
}

export function TopEndpointsCard({ requestsPerEndpoint }: TopEndpointsCardProps) {
  const topEndpoints = Object.entries(requestsPerEndpoint)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Топ endpoints</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topEndpoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет данных за выбранный период
            </p>
          ) : (
            topEndpoints.map(([endpoint, count], index) => (
              <div
                key={endpoint}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold shadow-sm shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-mono truncate">{endpoint}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{count.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">запросов</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
