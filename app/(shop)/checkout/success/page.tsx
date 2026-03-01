"use client";

import { DesignButton } from "@/shared/components/ui/design-button";
import { CART_ACTIONS } from "@/shared/constants";
import gsap from "gsap";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const paid = searchParams.get("paid");

  const iconRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Страницу завершения показываем только после редиректа с оплаты (есть uid)
  useEffect(() => {
    if (!uid || uid.trim() === "") {
      router.replace("/checkout");
    }
  }, [uid, router]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const icon = iconRef.current;
    const path = checkRef.current;
    const title = titleRef.current;
    const desc = descRef.current;
    if (!icon || !path || !title || !desc) return;

    const pathLen = path.getTotalLength?.();
    gsap.set(path, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
    gsap.set([icon, title, desc], { opacity: 0, scale: 0.8 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(icon, { opacity: 1, scale: 1, duration: 0.5 })
      .to(path, { strokeDashoffset: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.2")
      .to(title, { opacity: 1, scale: 1, duration: 0.4 }, "-=0.1")
      .to(desc, { opacity: 1, scale: 1, duration: 0.35 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, [paid]);

  // Пока редирект не сработал — не рендерим контент
  if (!uid || uid.trim() === "") {
    return null;
  }

  const isPaid = paid === "1";

  if (!isPaid) {
    return (
      <section className="space-y-6 text-sm">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center ring-2 ring-amber-200/80">
            <AlertCircle className="w-8 h-8 text-amber-600" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-800">Оплата не прошла</h1>
          <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
            При оплате произошла ошибка или операция была отменена. Заказ сохранён — вы можете
            оплатить его в личном кабинете в разделе «Мои заказы».
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href={`/account/orders/${uid}`} className="flex-1">
            <DesignButton
              variant="default"
              className="w-full h-14 rounded-[10px] border-0 text-base"
            >
              Перейти к заказу и оплатить
            </DesignButton>
          </Link>
          <Link href="/catalog" className="flex-1">
            <DesignButton
              variant="outline"
              className="w-full h-14 rounded-[10px] border-neutral-300 text-base"
            >
              {CART_ACTIONS.continueShopping}
            </DesignButton>
          </Link>
        </div>

        <div className="text-center text-xs text-neutral-500 pt-4">
          <p>Если у вас возникли вопросы, свяжитесь с нами по email или телефону.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-sm">
      <div className="text-center space-y-4">
        <div
          ref={iconRef}
          className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center motion-reduce:opacity-100"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              ref={checkRef}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 ref={titleRef} className="text-2xl font-semibold motion-reduce:opacity-100">
          Спасибо за ваш заказ!
        </h1>
        <p ref={descRef} className="text-neutral-600 max-w-md mx-auto motion-reduce:opacity-100">
          Ваш заказ успешно оплачен. Мы отправили письмо с деталями заказа на ваш e-mail. Статус
          заказа можно отслеживать в личном кабинете.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link href="/account/orders" className="flex-1">
          <DesignButton variant="default" className="w-full h-14 rounded-[10px] border-0 text-base">
            Перейти в личный кабинет
          </DesignButton>
        </Link>
        <Link href="/catalog" className="flex-1">
          <DesignButton
            variant="outline"
            className="w-full h-14 rounded-[10px] border-neutral-300 text-base"
          >
            {CART_ACTIONS.continueShopping}
          </DesignButton>
        </Link>
      </div>

      <div className="text-center text-xs text-neutral-500 pt-4">
        <p>Если у вас возникли вопросы, свяжитесь с нами по email или телефону.</p>
      </div>
    </section>
  );
}
