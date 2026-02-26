"use client";

import { DesignButton, Input, Spinner } from "@/shared/components/ui";
import { CheckboxOption } from "@/shared/components/ui/checkbox-option";
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
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split("; csrf_token=");
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

interface NewsletterSubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Модалка подписки на новости магазина.
 * В стиле промокода: инпут email, кнопка, чекбокс согласия, ссылка на политику.
 */
export function NewsletterSubscribeModal({
  open,
  onOpenChange,
  className,
}: NewsletterSubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Подтвердите согласие на получение рассылки");
      return;
    }
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Введите email");
      return;
    }
    setLoading(true);
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      const res = await fetch("/api/shop/newsletter/subscribe", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: trimmed,
          consent: true,
          source: "footer",
        }),
      });
      const data: { success?: boolean; message?: string } = res.ok || res.status === 400
        ? await res.json()
        : { success: false, message: "Ошибка сервера. Попробуйте позже." };
      if (data.success) {
        toast.success(data.message ?? "Готово");
        setEmail("");
        setConsent(false);
        onOpenChange(false);
      } else {
        toast.error(data.message ?? "Ошибка подписки");
      }
    } catch {
      toast.error("Ошибка подключения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("shop", SHOP_MODAL_CONTENT_CLASS, className)}>
        <DialogHeader className="pb-4">
          <DialogTitle className={SHOP_MODAL_TITLE_CLASS}>
            Подписаться на новости
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={cn("flex flex-col", SHOP_MODAL_BODY_GAP)}>
          <DialogDescription className={SHOP_MODAL_DESCRIPTION_CLASS}>
            Узнавайте первыми о новинках, акциях и скидках. Укажите email и подтвердите подписку в письме.
          </DialogDescription>
          <label htmlFor="newsletter-email" className="flex flex-col gap-2">
            <span className={INPUT_LABEL_CLASS}>Email</span>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </label>
          <div className="pt-1">
            <CheckboxOption
              checked={consent}
              onChange={setConsent}
              label={
                <>
                  Я соглашаюсь на получение рассылки и с{" "}
                  <Link
                    href="/privacy"
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    политикой конфиденциальности
                  </Link>
                </>
              }
            />
          </div>
          <DesignButton
            type="submit"
            variant="primary"
            className="h-14 w-full"
            disabled={loading || !consent}
          >
            {loading ? <Spinner className="h-5 w-5" /> : "Подписаться"}
          </DesignButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
