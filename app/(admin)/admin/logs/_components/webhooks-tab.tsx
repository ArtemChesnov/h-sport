"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PaginationControls } from "../../components/common/pagination-controls";
import { useWebhookLogs, type WebhookResultType } from "./use-webhook-logs";
import { Webhook, AlertCircle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

const RESULT_LABELS: Record<WebhookResultType, { label: string; icon: typeof CheckCircle2 }> = {
  SUCCESS: { label: "Успех", icon: CheckCircle2 },
  REPLAY: { label: "Replay", icon: RefreshCw },
  ERROR: { label: "Ошибка", icon: XCircle },
};

export function WebhooksTab() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [sourceInput, setSourceInput] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSourceChange = useCallback((value: string) => {
    setSourceInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSourceFilter(value);
      setPage(1);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data, isLoading, error } = useWebhookLogs(
    page,
    perPage,
    sourceFilter.trim() || undefined
  );

  const totalPages = data
    ? Math.ceil(data.pagination.total / data.pagination.perPage)
    : 0;

  if (error) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Ошибка загрузки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Не удалось загрузить лог webhook-вызовов
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-cyan-600" />
          <CardTitle className="text-base font-semibold">Входящие webhook&apos;и</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Факт вызова, IP, результат (успех / replay / ошибка)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-source" className="text-xs">
              Источник
            </Label>
            <Input
              id="webhook-source"
              placeholder="Например: robokassa"
              className="w-[180px]"
              value={sourceInput}
              onChange={(e) => handleSourceChange(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data?.items.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Время</TableHead>
                <TableHead className="w-[100px]">Источник</TableHead>
                <TableHead className="w-[100px]">Результат</TableHead>
                <TableHead className="w-[100px]">InvId</TableHead>
                <TableHead className="w-[120px]">IP</TableHead>
                <TableHead>Сообщение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => {
                const resultInfo = RESULT_LABELS[item.result];
                const Icon = resultInfo.icon;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs px-1.5 py-0.5 rounded bg-muted">
                        {item.source}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          item.result === "SUCCESS"
                            ? "text-green-600"
                            : item.result === "REPLAY"
                              ? "text-amber-600"
                              : "text-destructive"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {resultInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{item.invId ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{item.ip ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {item.message ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Записей не найдено
          </div>
        )}
      </CardContent>
      {data && totalPages > 1 && (
        <CardFooter className="border-t border-border/50 bg-muted/20 pt-4">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardFooter>
      )}
    </Card>
  );
}
