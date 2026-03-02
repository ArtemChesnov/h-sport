"use client";

import React from "react";

import { MENU_CUSTOMER_LINKS, MENU_PRIMARY_LINKS } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
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

interface Props {
  className?: string;
}

export const MenuDrawer: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  const [open, setOpen] = React.useState(false);
  const { setPendingPath } = useShopNav();

  const closeDrawer = React.useCallback(() => setOpen(false), []);

  const handleLinkClick = React.useCallback(
    (href: string) => {
      setPendingPath(href);
      setOpen(false);
    },
    [setPendingPath]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="left"
        data-menu-drawer
        className={cn(
          "shop flex flex-col bg-[#FDF7F8] pl-[30px] pt-5 pb-5 border-0 w-full max-w-full md:w-[540px] md:min-w-[540px]",
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
          {/* Основные ссылки */}
          <nav className="flex flex-col gap-4 menu-drawer-nav">
            {MENU_PRIMARY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className={cn(
                  "inline-flex leading-none text-[16px] min-[577px]:text-[20px] font-light hover:text-[#EB6081] transition-colors",
                  className
                )}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Покупателям — прижат к низу с отступом */}
        <div className="mt-auto flex flex-col gap-15 pb-8 menu-drawer-contacts">
          <nav className="flex flex-col menu-drawer-customer">
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
                    "inline-flex leading-none text-[16px] min-[577px]:text-[20px] font-light hover:text-[#EB6081] transition-colors",
                    className
                  )}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
