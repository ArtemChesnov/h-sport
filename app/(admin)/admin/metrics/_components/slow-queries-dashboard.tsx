"use client";

/**
 * Компонент для отображения медленных запросов к БД
 */

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSlowQueries } from "./hooks/use-slow-queries";
import { PaginationControls } from "../../components/common/pagination-controls";
import { Database, Clock, Search, AlertCircle } from "lucide-react";

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms} мс`;
  }
  return `${(ms / 1000).toFixed(2)} с`;
}

function SlowQueriesTable({ items }: { items: Array<{
  id: number;
  query: string;
  duration: number;
  endpoint: string | null;
  userId: string | null;
  createdAt: string;
}> }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Медленные запросы не найдены
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Время</TableHead>
          <TableHead className="w-[120px]">Длительность</TableHead>
          <TableHead className="w-[200px]">Endpoint</TableHead>
          <TableHead>SQL запрос</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
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
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-medium text-amber-700">
                  {formatDuration(item.duration)}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs">
              {item.endpoint ? (
                <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                  {item.endpoint}
                </code>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">
                {item.query}
              </code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SlowQueriesDashboard() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [period, setPeriod] = useState(7); // 7 дней по умолчанию
  const [minDuration, setMinDuration] = useState<number | undefined>(undefined);
  const [endpointFilter, setEndpointFilter] = useState("");

  const { data, isLoading, error } = useSlowQueries({
    page,
    perPage,
    period,
    minDuration,
    endpoint: endpointFilter || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
            Не удалось загрузить данные о медленных запросах
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">Медленные запросы</CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs">
            {data ? (
              <>
                Найдено {data.meta.total} {data.meta.total === 1 ? "запрос" : data.meta.total < 5 ? "запроса" : "запросов"} · страница {data.meta.page} из {data.meta.pages}
              </>
            ) : (
              "Запросы, которые выполняются дольше порогового значения"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Фильтры */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="period" className="text-xs">Период (дни)</Label>
              <Select
                value={String(period)}
                onValueChange={(value) => {
                  setPeriod(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minDuration" className="text-xs">Минимальная длительность (мс)</Label>
              <Input
                id="minDuration"
                type="number"
                placeholder="Не задано"
                value={minDuration || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setMinDuration(value ? Number(value) : undefined);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-xs">Endpoint</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endpoint"
                  placeholder="Поиск по endpoint..."
                  className="pl-8"
                  value={endpointFilter}
                  onChange={(e) => {
                    setEndpointFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Таблица */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data ? (
            <SlowQueriesTable items={data.items} />
          ) : null}
        </CardContent>

        {data && data.meta.pages > 1 && (
          <CardFooter className="border-t border-border/50 bg-muted/20 pt-4">
            <PaginationControls
              currentPage={data.meta.page}
              totalPages={data.meta.pages}
              onPageChange={handlePageChange}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
