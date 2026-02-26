/**
 * Карточка со статус-кодами HTTP ответов
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { TrendingUp } from "lucide-react";

interface StatusCodesCardProps {
  statusCodes: Record<number, number>;
}

export function StatusCodesCard({ statusCodes }: StatusCodesCardProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Статус-коды</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(statusCodes)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([code, count]) => {
              const statusCode = parseInt(code);
              const color =
                statusCode >= 500
                  ? "text-red-600 bg-red-50 border-red-200"
                  : statusCode >= 400
                    ? "text-orange-600 bg-orange-50 border-orange-200"
                    : statusCode >= 300
                      ? "text-blue-600 bg-blue-50 border-blue-200"
                      : "text-green-600 bg-green-50 border-green-200";

              return (
                <div
                  key={code}
                  className={`flex items-center justify-between p-3 rounded-lg border ${color}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{code}</span>
                    <span className="text-xs text-muted-foreground">
                      {statusCode >= 500
                        ? "Ошибка сервера"
                        : statusCode >= 400
                          ? "Ошибка клиента"
                          : statusCode >= 300
                            ? "Перенаправление"
                            : "Успешно"}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{count.toLocaleString()}</span>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
