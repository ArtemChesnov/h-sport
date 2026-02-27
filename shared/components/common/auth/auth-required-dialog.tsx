"use client";

import { DesignButton } from "@/shared/components/ui/design-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  SHOP_MODAL_CONTENT_CLASS,
  SHOP_MODAL_DESCRIPTION_CLASS,
  SHOP_MODAL_TITLE_CLASS,
} from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";

type AuthRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

/**
 * Модальное окно, которое показывается когда требуется авторизация.
 * Стиль единый с остальными модалками магазина.
 */
export function AuthRequiredDialog({
  open,
  onOpenChange,
  title = "Требуется авторизация",
  description = "Для использования этой функции необходимо войти в аккаунт или зарегистрироваться.",
}: AuthRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("shop", SHOP_MODAL_CONTENT_CLASS)}>
        <DialogHeader className="pb-4 text-left">
          <DialogTitle className={cn(SHOP_MODAL_TITLE_CLASS, "text-left")}>{title}</DialogTitle>
          <DialogDescription className={cn(SHOP_MODAL_DESCRIPTION_CLASS, "mt-2 text-left text-sm")}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <Link href="/auth/sign-in" onClick={() => onOpenChange(false)}>
            <DesignButton variant="primary" className="h-14 w-full">
              Войти
            </DesignButton>
          </Link>
          <Link href="/auth/sign-up" onClick={() => onOpenChange(false)}>
            <DesignButton variant="outline" className="h-14 w-full">
              Зарегистрироваться
            </DesignButton>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
