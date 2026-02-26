"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui";
import { Filter } from "lucide-react";

export type ConfirmedFilter = "all" | "confirmed" | "pending";

type NewsletterSubscribersFiltersProps = {
  email: string;
  confirmedFilter: ConfirmedFilter;
  total: number;
  onEmailChange: (value: string) => void;
  onConfirmedChange: (value: ConfirmedFilter) => void;
};

export function NewsletterSubscribersFilters(props: NewsletterSubscribersFiltersProps) {
  const { email, confirmedFilter, total, onEmailChange, onConfirmedChange } = props;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-rose-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-5 w-5 text-rose-600" />
          <CardTitle className="text-base font-semibold">Фильтры</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Поиск по email и статус подписки
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Поиск по email…"
            className="h-9 text-xs"
          />
          <div className="md:w-[180px]">
            <Select
              value={confirmedFilter}
              onValueChange={(v) => onConfirmedChange(v as ConfirmedFilter)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="confirmed">Подтверждённые</SelectItem>
                <SelectItem value="pending">Ожидают</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="text-xs text-muted-foreground">
              Всего: <span className="font-medium text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
