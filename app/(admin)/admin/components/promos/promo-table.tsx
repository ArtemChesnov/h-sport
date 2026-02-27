"use client";

import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib/formatters";
import { formatPromoType, formatPromoValue, formatPromoPeriod } from "../../lib/promos";
import { Loader2 } from "lucide-react";

type PromoTableProps = {
  items: DTO.AdminPromoCodeDto[];
  onToggleActive: (promo: DTO.AdminPromoCodeDto, nextActive: boolean) => void;
  onDelete: (promo: DTO.AdminPromoCodeDto) => void;
  isDeleting: boolean;
  isToggling?: boolean;
  togglingPromoId?: number;
};

/**
 * Таблица промокодов.
 */
export function PromoTable(props: PromoTableProps) {
  const { items, onToggleActive, onDelete, isDeleting, isToggling, togglingPromoId } = props;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/50">
            <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">Код</TableHead>
            <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">Тип</TableHead>
            <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">
              Значение
            </TableHead>
            <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">
              Ограничения
            </TableHead>
            <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">
              Период
            </TableHead>
            <TableHead className="text-right font-semibold text-xs h-12 align-middle pl-4 pr-4">
              Активен
            </TableHead>
            <TableHead className="text-right font-semibold text-xs h-12 align-middle pl-4 pr-4">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((promo) => (
            <TableRow
              key={promo.id}
              className="group border-b border-border/30 transition-all hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 hover:shadow-sm"
            >
              <TableCell className="font-semibold text-sm h-14 align-middle pl-4 pr-4">
                <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200/50 shadow-sm">
                  {promo.code}
                </span>
              </TableCell>

              <TableCell className="text-sm font-medium group-hover:text-foreground transition-colors h-14 align-middle pl-4 pr-4">
                {formatPromoType(promo.type)}
              </TableCell>

              <TableCell className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-800 transition-colors h-14 align-middle pl-4 pr-4">
                {formatPromoValue(promo.type as DTO.PromoTypeDto, promo.value)}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors h-14 align-middle pl-4 pr-4">
                <div className="flex flex-col gap-1.5">
                  <span>
                    Мин. сумма:{" "}
                    <span className="font-medium text-foreground">
                      {promo.minOrder ? formatMoney(promo.minOrder) : "—"}
                    </span>
                  </span>
                  <span>
                    Лимит:{" "}
                    <span className="font-medium text-foreground">
                      {promo.usageLimit
                        ? `${promo.usedCount}/${promo.usageLimit}`
                        : `∞ (исп.: ${promo.usedCount})`}
                    </span>
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors h-14 align-middle pl-4 pr-4">
                <div className="flex flex-col gap-1.5">
                  {promo.endsAt === null ? (
                    <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
                      Бессрочный
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">
                      {formatPromoPeriod(promo.startsAt, promo.endsAt)}
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-right h-14 align-middle pl-4 pr-4">
                <div className="flex justify-end items-center gap-2">
                  {isToggling && togglingPromoId === promo.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  )}
                  <Switch
                    checked={promo.isActive}
                    onCheckedChange={(next) => onToggleActive(promo, next)}
                    disabled={isDeleting || (isToggling && togglingPromoId === promo.id)}
                    className={isToggling && togglingPromoId === promo.id ? "opacity-60" : ""}
                  />
                </div>
              </TableCell>

              <TableCell className="text-right h-14 align-middle pl-4 pr-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onDelete(promo)}
                    disabled={isDeleting}
                    className="h-9 transition-all hover:bg-red-50 hover:text-red-700 hover:border-red-200 hover:shadow-sm"
                  >
                    Удалить
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
