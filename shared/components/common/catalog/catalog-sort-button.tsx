"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildSearchString, type ProductsSearchParams } from "@/shared/lib/search";
import { cn } from "@/shared/lib/utils";
import { DTO } from "@/shared/services";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";
import { ArrowUpDown } from "lucide-react";

export type CatalogSortValue = "new" | "price_asc" | "price_desc" | "popular";

type SortValue = NonNullable<DTO.ProductsQueryDto["sort"]>;
const ALLOWED_SORT: SortValue[] = ["new", "price_asc", "price_desc", "popular"];

const SORT_OPTIONS: { value: CatalogSortValue; label: string }[] = [
  { value: "new", label: "По новизне" },
  { value: "price_asc", label: "По цене ↑" },
  { value: "price_desc", label: "По цене ↓" },
  { value: "popular", label: "По популярности" },
];

type CatalogSortButtonProps = {
  className?: string;
};

export const CatalogSortButton: React.FC<CatalogSortButtonProps> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  // Текущие параметры каталога из URL
  const params = React.useMemo<ProductsSearchParams>(() => {
    const pageRaw = searchParams.get("page") ?? "1";
    const perPageRaw = searchParams.get("perPage") ?? "24";
    const categorySlugs = searchParams.getAll("categorySlug").filter(Boolean);
    const categorySlug = categorySlugs.length > 0 ? categorySlugs : undefined;
    const sortRaw = searchParams.get("sort") as DTO.ProductsQueryDto["sort"];
    const q = searchParams.get("q") || "";

    // Сохраняем все фильтры
    const priceFromRaw = searchParams.get("priceFrom");
    const priceFrom = priceFromRaw ? Number(priceFromRaw) : undefined;
    const priceToRaw = searchParams.get("priceTo");
    const priceTo = priceToRaw ? Number(priceToRaw) : undefined;
    const sizes = searchParams.getAll("size").filter(Boolean) as DTO.SizeDto[];
    const size = sizes.length > 0 ? sizes : undefined;
    const colors = searchParams.getAll("color").filter(Boolean);
    const color = colors.length > 0 ? colors : undefined;

    const page = Math.max(Number(pageRaw) || 1, 1);
    const perPage = Math.min(Math.max(Number(perPageRaw) || 24, 1), 24);

    const sort: SortValue = ALLOWED_SORT.includes(sortRaw as SortValue)
      ? (sortRaw as SortValue)
      : "new";

    return { page, perPage, categorySlug, sort, q, priceFrom, priceTo, size, color };
  }, [searchParams]);

  const activeSort: CatalogSortValue = (params.sort as CatalogSortValue) ?? "new";

  const handleSelect = (value: CatalogSortValue) => {
    // Закрываем Popover мгновенно для быстрой обратной связи
    setOpen(false);

    // Мгновенное обновление без задержки
    const nextParams: ProductsSearchParams = {
      ...params,
      page: 1, // при смене сортировки всегда с первой страницы
      sort: value,
    };

    const url = `/catalog${buildSearchString(nextParams)}`;

    // Используем только router.replace с scroll: false
    // Это предотвращает двойное обновление и дёргание страницы
    router.replace(url, { scroll: false });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className={cn("self-start", className)}>
          <span className={"text-[18px] font-light"}>Сортировка</span>
          <ArrowUpDown className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="shop w-[220px] rounded-[10px] border border-border bg-popover p-1 text-[14px] font-normal"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex w-full items-baseline justify-between rounded-md px-3 py-2 text-left text-[14px] font-normal cursor-pointer",
              "hover:bg-accent",
              option.value === activeSort && "text-primary"
            )}
          >
            <span>{option.label}</span>
            {option.value === activeSort && (
              <span className="ml-0 text-[10px] uppercase tracking-wide">выбрано</span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
