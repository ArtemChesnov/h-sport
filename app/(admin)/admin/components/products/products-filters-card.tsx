"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { DTO } from "@/shared/services";
import type { ProductsSearchParams } from "@/shared/lib/search";
import { Filter } from "lucide-react";

type SortValue = NonNullable<DTO.ProductsQueryDto["sort"]>;

type ProductsFiltersCardProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categorySlug: string | undefined;
  sort: SortValue;
  categories: Array<{ id: number; name: string; slug: string }>;
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  onFilterChange: (params: ProductsSearchParams) => void;
  onReset: () => void;
};

/**
 * Карточка с фильтрами для списка товаров.
 */
export function ProductsFiltersCard(props: ProductsFiltersCardProps) {
  const {
    searchValue,
    onSearchChange,
    categorySlug,
    sort,
    categories,
    isCategoriesLoading,
    isCategoriesError,
    onFilterChange,
    onReset,
  } = props;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-teal-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-base font-semibold">Фильтры</CardTitle>
        </div>
        <CardDescription className="text-xs">Поиск, категория, сортировка</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="q"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            ></label>
            <Input
              id="q"
              name="q"
              type="search"
              placeholder='Например, "Куртка", "Топ" или "HS-TOP-0310-XXS-CLR-01"'
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
            <div className="w-auto">
              <label
                htmlFor="categorySlug"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Категория
              </label>

              <Select
                value={categorySlug ?? "all"}
                onValueChange={(value) => {
                  const nextCategorySlug = value === "all" ? undefined : value;
                  onFilterChange({
                    page: 1,
                    perPage: 20,
                    categorySlug: nextCategorySlug,
                    sort,
                    q: searchValue,
                  });
                }}
                disabled={isCategoriesLoading || isCategoriesError}
              >
                <SelectTrigger className="cursor-pointer" id="categorySlug">
                  <SelectValue
                    placeholder={isCategoriesLoading ? "Загрузка категорий..." : "Все категории"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">
                    Все категории
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem className="cursor-pointer" key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-auto">
              <label
                htmlFor="sort"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Сортировка
              </label>

              <Select
                value={sort ?? "new"}
                onValueChange={(value: string) => {
                  const sortValue = (value as DTO.ProductsQueryDto["sort"]) ?? "new";
                  onFilterChange({
                    page: 1,
                    perPage: 20,
                    categorySlug,
                    sort: sortValue,
                    q: searchValue,
                  });
                }}
              >
                <SelectTrigger id="sort">
                  <SelectValue className="cursor-pointer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="new">
                    По новизне
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="price_asc">
                    По цене ↑
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="price_desc">
                    По цене ↓
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="popular">
                    По популярности
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onReset}
              className="w-full sm:w-auto"
            >
              Сбросить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
