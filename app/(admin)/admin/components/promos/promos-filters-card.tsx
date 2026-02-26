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

type ActiveFilter = "all" | "active" | "inactive";

type PromosFiltersCardProps = {
  code: string;
  activeFilter: ActiveFilter;
  total: number;
  onCodeChange: (value: string) => void;
  onFilterChange: (value: ActiveFilter) => void;
};

/**
 * Карточка с фильтрами для промокодов.
 */
export function PromosFiltersCard(props: PromosFiltersCardProps) {
  const { code, activeFilter, total, onCodeChange, onFilterChange } = props;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-amber-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base font-semibold">Фильтры</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Поиск по коду и статус
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Поиск по коду…"
            className="h-9 text-xs"
          />
<div className="md:w-[180px]">
          <Select
            value={activeFilter}
            onValueChange={(v) => onFilterChange(v as ActiveFilter)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="text-xs text-muted-foreground">
              Всего:{" "}
              <span className="font-medium text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



