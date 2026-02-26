"use client";

import { DesignButton } from "@/shared/components/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    INPUT_LABEL_CLASS,
    SHOP_MODAL_BODY_GAP,
    SHOP_MODAL_CONTENT_CLASS,
    SHOP_MODAL_DESCRIPTION_CLASS,
    SHOP_MODAL_TITLE_CLASS,
} from "@/shared/constants";
import { cn } from "@/shared/lib";
import { toast } from "sonner";

const PROMO_CODE = "WELCOME10";

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // clipboard API failed (e.g. permission denied), try fallback
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "2px";
    el.style.height = "2px";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

interface PromoCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Модалка с промокодом для первого заказа.
 * Оформлена в стилистике сайта (розовый акцент #EB6081).
 */
export function PromoCodeModal({ open, onOpenChange, className }: PromoCodeModalProps) {
  const handleCopy = async () => {
    const copied = await copyToClipboard(PROMO_CODE);
    if (copied) {
      toast.success("Промокод скопирован");
    } else {
      toast.error("Скопируйте код вручную: " + PROMO_CODE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("shop", SHOP_MODAL_CONTENT_CLASS, className)}>
        <DialogHeader className="pb-4">
          <DialogTitle className={SHOP_MODAL_TITLE_CLASS}>
            Промокод на первый заказ
          </DialogTitle>
        </DialogHeader>
        <div className={cn("flex flex-col", SHOP_MODAL_BODY_GAP)}>
          <DialogDescription className={SHOP_MODAL_DESCRIPTION_CLASS}>
            Спасибо, что вы с нами. Используйте промокод при оформлении первого заказа — он даёт
            скидку 10% на весь заказ.
          </DialogDescription>
          <div className="flex flex-col gap-3">
            <span className={INPUT_LABEL_CLASS}>
              Скопируйте код и введите в корзине:
            </span>
            <DesignButton
              type="button"
              variant="outline"
              className="h-14 w-full font-mono text-[20px] tracking-wide sm:text-[24px]"
              onClick={handleCopy}
            >
              {PROMO_CODE}
            </DesignButton>
            <p className="text-[14px] text-muted-foreground">
              Нажмите на код, чтобы скопировать
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
