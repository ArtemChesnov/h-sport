/**
 * Карточка с топом страниц по метрикам Web Vitals
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Globe } from "lucide-react";
import { formatMetricValue } from "../utils";

interface TopPage {
  url: string;
  metrics: Record<string, number>;
}

interface TopPagesCardProps {
  topPages: TopPage[];
}

export function TopPagesCard({ topPages }: TopPagesCardProps) {
  if (topPages.length === 0) return null;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Топ страниц по метрикам</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topPages.map((page, index) => (
            <div
              key={page.url}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-xs font-bold shadow-sm shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{page.url}</div>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    {Object.entries(page.metrics).map(([name, value]) => (
                      <span key={name}>
                        {name}: {formatMetricValue(name, value)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
