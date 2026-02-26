"use client";

import { ContactsBlock } from "@/shared/components/common/ui";
import { DesignButton } from "@/shared/components/ui";
import { CART_LABELS } from "@/shared/constants";
import { useNewsletterModal } from "@/shared/contexts/newsletter-modal-context";
import { cn } from "@/shared/lib";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Container } from "./layout";

interface Props {
  className?: string;
}

/** Страницы авторизации/регистрации/смены пароля — футер не показываем. */
const AUTH_PATH_PREFIX = "/auth";

/**
 * Футер магазина: изображение + блок с кнопкой подписки на новости и контактами.
 * Не отображается на страницах входа, регистрации, смены пароля и успешного изменения.
 */
export const Footer: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const { openNewsletterModal } = useNewsletterModal();

  if (pathname?.startsWith(AUTH_PATH_PREFIX)) {
    return null;
  }

  return (
    <footer className={cn("relative mt-60 max-[1440px]:mt-25", className)}>
      <Container>
        {/* Фоновое изображение */}
        <div className="relative w-full h-80   min-[576px]:h-130 min-[768px]:h-170 min-[1024px]:h-215 min-[1280px]:h-270 min-[1920px]:h-270 overflow-hidden">
          <Image
            src="/assets/images/footer-img.webp"
            alt="H-Sport — подпишитесь на новости"
            fill
            sizes="100vw"
            quality={85}
            className="object-cover"
          />

          <h5
            className={
              "min-[1920px]:text-[48px] font-bold uppercase min-[1920px]:max-w-225 absolute left-7.5 bottom-10 min-[390px]:left-6 min-[390px]:bottom-8  min-[1600px]:text-[36px] min-[1600px]:max-w-160 min-[1440px]:text-[36px] min-[1440px]:max-w-160 min-[1280px]:text-[32px] min-[1280px]:max-w-150 min-[1024px]:text-[24px] min-[1024px]:max-w-110  min-[768px]:text-[18px] min-[768px]:max-w-84  min-[576px]:text-[18px] min-[576px]:max-w-84 min-[390px]:text-[12px] min-[390px]:max-w-56"
            }
          >
            Открой мир спорта — подписывайся на рассылку и получай уникальные предложения и тренды
            первым!
          </h5>
        </div>

        {/* Контент футера */}
        <div className="pt-8 md:pt-14 pb-6 md:pb-5 ">
          <div className="flex  max-[1280px]:gap-8  max-[768px]:flex-col max-[768px]:gap-12 min-[768px]:justify-between">
            <nav
              className="flex gap-30  max-[1440px]:gap-12 max-[1280px]:gap-10  max-[768px]:gap-14"
              aria-label="Навигация по сайту"
            >
              <ul className="flex flex-col gap-4 max-[1024px]:gap-3">
                <li>
                  <h4 className="text-[26px] font-light mb-1  max-[1280px]:text-[24px]">О нас</h4>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    О бренде
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link
                    href="/showroom"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Магазины
                  </Link>
                </li>
              </ul>
              <ul className="flex flex-col gap-4 max-[1024px]:gap-3">
                <li>
                  <h4 className="text-[26px] font-light mb-1 max-[1280px]:text-[24px]">Клиентам</h4>
                </li>
                <li>
                  <Link
                    href="/payment-delivery"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Оплата
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment-delivery"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment-delivery#обмен-и-возврат"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Возврат
                  </Link>
                </li>
              </ul>
              <ul className="flex flex-col gap-4 max-[1024px]:gap-3">
                <li>
                  <h4 className="text-[26px] font-light mb-1 max-[1280px]:text-[24px]">Аккаунт</h4>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Личный кабинет
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    {CART_LABELS.title}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    className="link-underline text-[18px] font-light hover:text-primary transition-colors max-[1280px]:text-[16px]"
                  >
                    Избранное
                  </Link>
                </li>
              </ul>
            </nav>
            <div
              className={
                "flex gap-20  max-[1440px]:gap-12 max-[1280px]:gap-10 max-[1024px]:flex-col max-[768px]:items-start max-[768px]:text-left"
              }
            >
              <div className="flex flex-col  gap-4 md:items-start max-[1024px]:gap-3">
                <h3 className="text-[26px] font-light leading-[120%] uppercase max-[1280px]:text-[24px]">
                  Будьте в курсе новинок
                </h3>
                <p className="max-w-85  text-[14px] font-light leading-[150%] text-text-primary md:text-left max-[1280px]:text-[12px] max-[1280px]:max-w-68">
                  Подпишитесь на нашу рассылку и узнавайте первыми о новых коллекциях, акциях и
                  скидках.
                </p>
                <DesignButton
                  variant="outline"
                  onClick={openNewsletterModal}
                  className="group  flex  gap-2.5 rounded-[10px]"
                  size={"lg"}
                >
                  <span className="text-[16px] leading-[100%]">Подписаться на новости</span>
                  <Mail
                    className="h-6 w-6 stroke-[#1F1E1E] transition-colors group-hover:stroke-white"
                    aria-hidden="true"
                  />
                </DesignButton>
              </div>

              <ContactsBlock />
            </div>
          </div>

          {/* Копирайт */}
          <div className="mt-14 border-t border-border/50 pt-6 flex justify-between max-[768px]:flex-col max-[768px]:gap-3">
            <p className="text-[12px] text-text-secondary">
              © {new Date().getFullYear()} H-Sport. Все права защищены.
            </p>
            <Link
              href="/sales-rules"
              className="link-underline text-[12px] text-text-secondary hover:text-primary transition-colors"
            >
              Пользовательское соглашение
            </Link>
            <Link
              href="/privacy"
              className="link-underline text-[12px] text-text-secondary hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
