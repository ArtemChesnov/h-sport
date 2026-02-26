"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { DTO } from "@/shared/services";
import { Filter } from "lucide-react";
import { FormEvent } from "react";
import { ADMIN_ORDER_STATUS_FILTER_VALUES, getOrderStatusLabel } from "../../orders/lib/constants";

type StatusFilterValue = "ALL" | DTO.OrderStatusDto;

type OrdersFiltersCardProps = {
  statusValue: StatusFilterValue;
  emailValue: string;
  onStatusChange: (value: StatusFilterValue) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

/**
 * Карточка с фильтрами для списка заказов.
 * Премиум дизайн в едином стиле
 */
export function OrdersFiltersCard(props: OrdersFiltersCardProps) {
  const {
    statusValue,
    emailValue,
    onStatusChange,
    onEmailChange,
    onSubmit,
    onReset,
  } = props;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Фильтры</CardTitle>
        </div>
        <CardDescription className="text-xs">
          По статусу и e-mail
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="mx-auto w-full">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-end md:gap-4">
              <div className="w-full md:w-[420px] space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={emailValue}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="client@mail.ru"
                />
              </div>
              <div className="w-full md:w-[180px]">
                <Label htmlFor="status" className="text-xs font-medium pb-1.5">Статус</Label>
                <Select
                  value={statusValue}
                  onValueChange={(v) => onStatusChange(v as StatusFilterValue)}
                >
                  <SelectTrigger id="status" className="h-9 text-xs w-full" size="default">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Все статусы</SelectItem>
                    {ADMIN_ORDER_STATUS_FILTER_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {getOrderStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2">
              <Button type="submit" size="sm" className="h-9 px-4">
                Применить
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 px-4"
                onClick={onReset}
              >
                Сбросить
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
