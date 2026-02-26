
"use client";

import { useAdminProductQuery } from "@/shared/hooks";
import {
  ColorBadge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui";
import { formatPrice } from "../../lib/utils";

/**
 * Вложенная таблица вариантов товара (каждый item — отдельная строка).
 */
export function ProductVariantsTable({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useAdminProductQuery(slug);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-xs text-destructive">
        Не удалось загрузить варианты товара. Попробуй открыть ещё раз.
      </div>
    );
  }

  const items = data.items ?? [];

  if (!items.length) {
    return (
      <div className="text-xs text-muted-foreground">
        Для этого товара пока нет вариантов.
      </div>
    );
  }

  // Группируем варианты по цвету: один цвет → список размеров, диапазон цен, наличие.
  type ColorGroup = {
    color: string;
    sizes: string[];
    priceMin: number;
    priceMax: number;
    hasAvailable: boolean;
  };

  const colorMap = new Map<string, ColorGroup>();

  for (const item of items) {
    const color = item.color;
    const existing = colorMap.get(color);

    if (!existing) {
      colorMap.set(color, {
        color,
        sizes: [item.size],
        priceMin: item.price,
        priceMax: item.price,
        hasAvailable: item.isAvailable,
      });
    } else {
      // добавляем размер (без дублей)
      if (!existing.sizes.includes(item.size)) {
        existing.sizes.push(item.size);
      }

      // обновляем цены
      if (item.price < existing.priceMin) {
        existing.priceMin = item.price;
      }
      if (item.price > existing.priceMax) {
        existing.priceMax = item.price;
      }

      // если хоть один вариант в наличии — считаем цвет "в наличии"
      existing.hasAvailable = existing.hasAvailable || item.isAvailable;
    }
  }

  const groups = Array.from(colorMap.values());

  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Варианты товара (по цветам):
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Цвет</TableHead>
            <TableHead className="text-xs">Размеры</TableHead>
            <TableHead className="text-xs text-right">Цена</TableHead>
            <TableHead className="text-xs text-right">Наличие</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {groups.map((group) => {
            const sizesLabel = group.sizes.join(", ");

            const priceLabel =
              group.priceMin === group.priceMax
                ? `${formatPrice(group.priceMin)} ₽`
                : `${formatPrice(group.priceMin)}–${formatPrice(group.priceMax)} ₽`;

            return (
              <TableRow key={group.color}>
                <TableCell className="text-xs">
                  <ColorBadge colorName={group.color} className="text-xs" />
                </TableCell>

                <TableCell className="text-xs">{sizesLabel}</TableCell>

                <TableCell className="text-right text-xs font-semibold">
                  {priceLabel}
                </TableCell>

                <TableCell className="text-right text-[11px]">
                  {group.hasAvailable ? (
                    <span className="text-emerald-600">В наличии</span>
                  ) : (
                    <span className="text-muted-foreground">Нет</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
