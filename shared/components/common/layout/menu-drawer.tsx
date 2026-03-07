"use client";

import React from "react";

import { MENU_CUSTOMER_LINKS, MENU_PRIMARY_LINKS } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
import { useAuthCheck, useCartCount } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { AuthRequiredDialog } from "../auth";
import { ContactsBlock } from "../ui";

interface Props {
  className?: string;
}

export const MenuDrawer: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  const [open, setOpen] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const { setPendingPath } = useShopNav();
  const cartCount = useCartCount();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();

  const closeDrawer = React.useCallback(() => setOpen(false), []);

  const handleLinkClick = React.useCallback(
    (href: string) => {
      setPendingPath(href);
      setOpen(false);
    },
    [setPendingPath]
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>

        <SheetContent
          side="left"
          data-menu-drawer
          className={cn(
            "shop flex flex-col bg-[#FDF7F8] pl-[30px] pr-[20px] pt-5 pb-5 border-0 w-full max-w-full md:w-[540px] md:min-w-[540px]",
            className
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle className="sr-only">Меню</SheetTitle>
            <SheetDescription className="sr-only">Навигация по сайту</SheetDescription>
          </SheetHeader>

          {/* Важно: в Linux/CI пути к файлам чувствительны к регистру. Адаптив как у лого в хедере. */}
          <Link href="/" onClick={closeDrawer} className="inline-block shrink-0 cursor-pointer">
            <Image
              alt="H Sport"
              src="/assets/logos/logo-big.png"
              width={55}
              height={104}
              className="h-auto w-10 sm:w-12 md:w-[55px] max-h-[80px] sm:max-h-[90px] md:max-h-[104px] object-contain"
            />
          </Link>

          <div className="flex flex-col mt-10 menu-drawer-section">
            {/* Основные ссылки — с подчёркиванием розовой полосой, шрифт 20px */}
            <nav className="flex flex-col gap-4 menu-drawer-nav">
              {MENU_PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  className={cn(
                    "inline-flex leading-none text-[20px] font-light hover:text-[#EB6081] transition-colors max-md:border-b max-md:border-[#EB6081] max-md:pb-2",
                    className
                  )}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Избранное, Корзина, Вход — отдельный блок, без подчёркивания, просто текст 20px */}
            <div className="flex flex-col gap-4 mt-6 menu-drawer-user">
              <Link
                href="/favorites"
                onClick={(e) => {
                  if (!isAuthenticated && !isAuthLoading) {
                    e.preventDefault();
                    setAuthDialogOpen(true);
                  } else {
                    handleLinkClick("/favorites");
                  }
                }}
                className={cn(
                  "inline-flex leading-none text-[20px] font-light hover:text-[#EB6081] transition-colors",
                  className
                )}
              >
                Избранное
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className={cn(
                  "inline-flex leading-none text-[20px] font-light hover:text-[#EB6081] transition-colors",
                  className
                )}
              >
                Корзина ({cartCount ?? 0})
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "#"}
                onClick={(e) => {
                  if (!isAuthenticated && !isAuthLoading) {
                    e.preventDefault();
                    setAuthDialogOpen(true);
                  } else {
                    handleLinkClick("/account");
                  }
                }}
                className={cn(
                  "inline-flex leading-none text-[20px] font-light hover:text-[#EB6081] transition-colors",
                  className
                )}
              >
                Вход в аккаунт
              </Link>
            </div>
          </div>

          {/* Покупателям (только десктоп) + Свяжитесь с нами — прижато к низу */}
          <div className="mt-auto flex flex-col gap-6 pb-8 menu-drawer-contacts">
            {/* Блок «Покупателям» скрыт на мобилках */}
            <nav className="hidden md:flex flex-col menu-drawer-customer">
              <h3
                className={cn(
                  "text-[20px] min-[577px]:text-[26px] font-light leading-[120%] mb-6 menu-drawer-heading",
                  className
                )}
              >
                Покупателям
              </h3>
              <div className="flex flex-col gap-4 menu-drawer-customer-links">
                {MENU_CUSTOMER_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={"target" in link ? link.target : undefined}
                    onClick={closeDrawer}
                    className={cn(
                      "inline-flex leading-none text-[20px] font-light hover:text-[#EB6081] transition-colors",
                      className
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Свяжитесь с нами: иконки 24×24, уменьшенный отступ от заголовка */}
            <div className="flex flex-col">
              <ContactsBlock
                className="menu-drawer-contacts-block [&_h3]:text-[20px] [&>div]:h-9 md:[&>div]:h-6 gap-2 [&_svg]:w-9 [&_svg]:h-9 [&_svg]:min-w-9 [&_svg]:min-h-9 md:[&_svg]:!w-6 md:[&_svg]:!h-6 md:[&_svg]:!min-w-6 md:[&_svg]:!min-h-6"
                iconSize={36}
                iconsOnly
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title="Войдите в аккаунт"
        description="Чтобы использовать эту функцию, необходимо войти в аккаунт или зарегистрироваться."
      />
    </>
  );
};
