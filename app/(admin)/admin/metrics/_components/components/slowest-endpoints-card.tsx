/**
 * Карточка с топом медленных запросов
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { TrendingDown } from "lucide-react";

interface SlowEndpoint {
  endpoint: string;
  method: string;
  avgDuration: number;
  count: number;
}

interface SlowestEndpointsCardProps {
  slowestEndpoints: SlowEndpoint[];
}

export function SlowestEndpointsCard({ slowestEndpoints }: SlowestEndpointsCardProps) {
  if (!slowestEndpoints || slowestEndpoints.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Топ медленных запросов</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {slowestEndpoints.slice(0, 5).map((endpoint, index) => (
            <div
              key={`${endpoint.method} ${endpoint.endpoint}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white text-xs font-bold shadow-sm shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono truncate">{endpoint.endpoint}</div>
                  <div className="text-xs text-muted-foreground">{endpoint.method} · {endpoint.count} запросов</div>
                </div>
              </div>
              <span className="text-sm font-semibold text-red-600 shrink-0">{endpoint.avgDuration}ms</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
