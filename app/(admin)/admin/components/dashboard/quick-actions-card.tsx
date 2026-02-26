"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui";
import { Plus, Package, ClipboardList, TicketPercent } from "lucide-react";

export function QuickActionsCard() {
  return (
    <div className="flex items-stretch gap-2 sm:gap-3 w-full overflow-x-auto pb-2 sm:pb-0">
      <Button
        asChild
        variant="outline"
        className="flex-1 min-w-[140px] sm:min-w-0 h-auto flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-all rounded-xl shrink-0"
      >
        <Link href="/admin/products/new" className="flex flex-col items-center gap-1.5 sm:gap-2">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Новый товар</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Добавить в каталог</div>
          </div>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="flex-1 min-w-[140px] sm:min-w-0 h-auto flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 hover:bg-teal-50 hover:border-teal-200 transition-all rounded-xl shrink-0"
      >
        <Link href="/admin/products" className="flex flex-col items-center gap-1.5 sm:gap-2">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Товары</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Управление каталогом</div>
          </div>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="flex-1 min-w-[140px] sm:min-w-0 h-auto flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 hover:bg-violet-50 hover:border-violet-200 transition-all rounded-xl shrink-0"
      >
        <Link href="/admin/orders" className="flex flex-col items-center gap-1.5 sm:gap-2">
          <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Заказы</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Просмотр заказов</div>
          </div>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="flex-1 min-w-[140px] sm:min-w-0 h-auto flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 hover:bg-amber-50 hover:border-amber-200 transition-all rounded-xl shrink-0"
      >
        <Link href="/admin/promos" className="flex flex-col items-center gap-1.5 sm:gap-2">
          <TicketPercent className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          <div className="text-center">
            <div className="font-semibold text-xs sm:text-sm">Промокоды</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Создать промокод</div>
          </div>
        </Link>
      </Button>
    </div>
  );
}
