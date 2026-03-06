"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { PaginationControls } from "../../components/common/pagination-controls";
import { useSecurityLogs, type SecurityEventType } from "./use-security-logs";
import { ShieldAlert, AlertCircle } from "lucide-react";

const TYPE_LABELS: Record<SecurityEventType, string> = {
  FAILED_LOGIN: "Неудачный вход",
  RATE_LIMIT: "Rate limit",
  INVALID_PAYMENT_SIGNATURE: "Неверная подпись платежа",
};

export function SecurityLogsTab() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [typeFilter, setTypeFilter] = useState<SecurityEventType | "all">("all");

  const { data, isLoading, error } = useSecurityLogs(
    page,
    perPage,
    typeFilter === "all" ? undefined : typeFilter
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
            Не удалось загрузить события безопасности
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base font-semibold">События безопасности</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Неудачные логины, срабатывания rate limit, неверная подпись платёжки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="security-type" className="text-xs">
              Тип события
            </Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as SecurityEventType | "all");
                setPage(1);
              }}
            >
              <SelectTrigger id="security-type" className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {(Object.keys(TYPE_LABELS) as SecurityEventType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHead className="w-[160px]">Тип</TableHead>
                <TableHead className="w-[120px]">IP</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
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
                    <span className="text-xs font-medium">
                      {TYPE_LABELS[item.type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {item.ip ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.details && typeof item.details === "object" ? (
                      <code className="px-1.5 py-0.5 rounded bg-muted break-all">
                        {JSON.stringify(item.details)}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Событий не найдено
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
