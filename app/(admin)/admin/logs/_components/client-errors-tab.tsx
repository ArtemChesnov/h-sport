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
import { PaginationControls } from "../../components/common/pagination-controls";
import { useClientErrorLogs } from "./use-client-error-logs";
import { AlertTriangle } from "lucide-react";

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

export function ClientErrorsTab() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  const { data, isLoading, error } = useClientErrorLogs(page, perPage);

  const totalPages = data
    ? Math.ceil(data.pagination.total / data.pagination.perPage)
    : 0;

  if (error) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Ошибка загрузки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Не удалось загрузить клиентские ошибки
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <CardTitle className="text-base font-semibold">Клиентские ошибки</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Ошибки с фронта (ErrorBoundary), отправленные через /api/errors/client
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data?.items.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Время</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead className="w-[200px]">URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-muted-foreground align-top">
                    {new Date(item.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-xs align-top">
                    <div className="font-medium text-foreground break-words max-w-md">
                      {truncate(item.message, 200)}
                    </div>
                    {item.stack && (
                      <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto max-h-20 overflow-y-auto rounded bg-muted/50 p-1.5 whitespace-pre-wrap break-words">
                        {truncate(item.stack, 300)}
                      </pre>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground align-top truncate max-w-[200px]">
                    {item.url ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
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
