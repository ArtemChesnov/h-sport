/**
 * Карточка распределения запросов по HTTP методам
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Gauge } from "lucide-react";

interface HttpMethodsCardProps {
  requestsPerMethod: Record<string, number>;
  totalRequests: number;
}

export function HttpMethodsCard({ requestsPerMethod, totalRequests }: HttpMethodsCardProps) {
  if (!requestsPerMethod || Object.keys(requestsPerMethod).length === 0) {
    return null;
  }

  const methodColors: Record<string, { gradient: string; shadow: string }> = {
    GET: {
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30"
    },
    POST: {
      gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/30"
    },
    PATCH: {
      gradient: "from-amber-400 via-amber-500 to-orange-500",
      shadow: "shadow-amber-500/30"
    },
    PUT: {
      gradient: "from-orange-400 via-orange-500 to-red-500",
      shadow: "shadow-orange-500/30"
    },
    DELETE: {
      gradient: "from-red-400 via-red-500 to-red-600",
      shadow: "shadow-red-500/30"
    },
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">По HTTP методам</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(requestsPerMethod)
            .sort(([, a], [, b]) => b - a)
            .map(([method, count]) => {
              const percentage = ((count / totalRequests) * 100).toFixed(1);
              const methodStyle = methodColors[method] || {
                gradient: "from-slate-400 via-slate-500 to-slate-600",
                shadow: "shadow-slate-500/30"
              };

              return (
                <div
                  key={method}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${methodStyle.gradient} text-white text-sm font-bold shadow-lg ${methodStyle.shadow}`}>
                    <span className="drop-shadow-sm">{method}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
