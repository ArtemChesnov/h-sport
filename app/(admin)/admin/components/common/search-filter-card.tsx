"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { Input, Label } from "@/shared/components/ui";
import { Search } from "lucide-react";

type SearchFilterCardProps = {
  title: string;
  description?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
};

/**
 * Общий компонент карточки с поиском и фильтрами.
 */
export function SearchFilterCard(props: SearchFilterCardProps) {
  const {
    title,
    description,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Поиск...",
    children,
  } = props;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-slate-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Search className="h-5 w-5 text-slate-600" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="search" className="text-xs"></Label>
            <Input
              id="search"
              name="search"
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 text-xs"
              placeholder={searchPlaceholder}
            />
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}



