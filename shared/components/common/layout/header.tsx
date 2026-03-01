"use client";

import {
  CartIcon,
  CartIconFilled,
  FavoritesFilledIcon,
  FavoritesIcon,
  UserIcon,
  UserIconFilled,
} from "@/shared/components/icons";
import { CART_LABELS } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
import { useAuthCheck, useCartCount, useFavoritesCount } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { CountLoader } from "../../ui/count-loader";
import { AuthRequiredDialog } from "../auth";
import { BurgerButton } from "./burger-button";
import { Container } from "./container";

/** Розовый сайта и primary для заливки при hover. Мобилка 32px (удобно пальцем), десктоп 42px. */
const ICON_PINK = "text-[#EB6081]";
const ICON_CLASS = "w-8 h-8 shrink-0 md:w-[42px] md:h-[42px]";

interface Props {
  className?: string;
}

function IconBadge({ count, "aria-label": ariaLabel }: { count: number; "aria-label"?: string }) {
  if (count <= 0) return null;
  const display = count > 99 ? "99+" : String(count);
  return (
    <span
      aria-label={ariaLabel}
      className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EB6081] px-1 text-xs font-medium text-white ring-2 ring-white shadow-sm"
    >
      {display}
    </span>
  );
}

export const Header: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();
  const { setPendingPath } = useShopNav();
  const favorites = useFavoritesCount();
  const cartCount = useCartCount();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  const isAuthPage = pathname?.startsWith("/auth");
  const isOverlayHeader = pathname === "/";

  if (isAuthPage) {
    return null;
  }

  const isFavoritesLoading = favorites === null;
  const isCartLoading = cartCount === null;
  const isLoading = isFavoritesLoading || isCartLoading;

  const handleFavoritesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated && !isAuthLoading) {
      e.preventDefault();
      setAuthDialogOpen(true);
      return;
    }
    setPendingPath("/favorites");
  };

  const handleAccountClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated && !isAuthLoading) {
      e.preventDefault();
      setAuthDialogOpen(true);
      return;
    }
    setPendingPath("/account");
  };

  const handleCartClick = () => {
    setPendingPath("/cart");
  };

  const handleLogoClick = () => {
    if (pathname !== "/") {
      setPendingPath("/");
    }
  };

  return (
    <>
      <header
        className={cn(
          "inset-x-0 top-0 z-20",
          isOverlayHeader ? "absolute" : "relative bg-background",
          className
        )}
      >
        <Container className="grid grid-cols-[1fr_auto_1fr] items-start pt-10">
          <div className="flex justify-start">
            <BurgerButton />
          </div>

          <Link
            href="/"
            onClick={handleLogoClick}
            className="cursor-pointer shrink-0 justify-self-center"
          >
            <Image
              alt="H Sport"
              src="/assets/logos/logo-big.png"
              width={55}
              height={104}
              priority
              className="h-auto w-10 sm:w-12 md:w-[55px] max-h-[80px] sm:max-h-[90px] md:max-h-[104px] object-contain"
            />
          </Link>

          <div className="flex items-center justify-end gap-2 md:gap-3 ">
            {/* Избранное: outline (розовый) по умолчанию, filled (primary) при hover. Спиннер синхронно с корзиной. */}
            <Link
              href="/favorites"
              onClick={handleFavoritesClick}
              className="group relative inline-flex h-10 w-10 min-w-10 items-center justify-center transition-colors md:h-[42px] md:w-[42px] md:min-w-[42px]"
              aria-label="Избранное"
            >
              {isLoading ? (
                <span className="flex h-6 w-6 items-center justify-center md:h-8 md:w-8">
                  <CountLoader />
                </span>
              ) : (
                <>
                  <FavoritesIcon
                    className={cn(
                      "absolute transition-opacity group-hover:opacity-0",
                      ICON_PINK,
                      ICON_CLASS
                    )}
                  />
                  <FavoritesFilledIcon
                    className={cn(
                      "absolute opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary",
                      ICON_CLASS
                    )}
                  />
                  <IconBadge count={favorites ?? 0} aria-label={`В избранном: ${favorites}`} />
                </>
              )}
            </Link>

            {/* Корзина: outline (розовый) по умолчанию, filled (primary) при hover. Спиннер синхронно с избранным. */}
            <Link
              href="/cart"
              onClick={handleCartClick}
              className="group relative inline-flex h-10 w-10 min-w-10 items-center justify-center transition-colors md:h-[42px] md:w-[42px] md:min-w-[42px]"
              aria-label={CART_LABELS.title}
            >
              {isLoading ? (
                <span className="flex h-6 w-6 items-center justify-center md:h-8 md:w-8">
                  <CountLoader />
                </span>
              ) : (
                <>
                  <CartIcon
                    className={cn(
                      "absolute transition-opacity group-hover:opacity-0",
                      ICON_PINK,
                      ICON_CLASS
                    )}
                  />
                  <CartIconFilled
                    className={cn(
                      "absolute opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary",
                      ICON_CLASS
                    )}
                  />
                  <IconBadge count={cartCount ?? 0} aria-label={`В корзине: ${cartCount}`} />
                </>
              )}
            </Link>

            {/* Аккаунт: outline (розовый) по умолчанию, filled (primary) при hover */}
            <Link
              href="/account"
              onClick={handleAccountClick}
              className="group relative inline-flex h-10 w-10 min-w-10 items-center justify-center transition-colors md:h-[42px] md:w-[42px] md:min-w-[42px]"
              aria-label="Личный кабинет"
            >
              <UserIcon
                className={cn(
                  "absolute transition-opacity group-hover:opacity-0",
                  ICON_PINK,
                  ICON_CLASS
                )}
              />
              <UserIconFilled
                className={cn(
                  "absolute opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary",
                  ICON_CLASS
                )}
              />
            </Link>
          </div>
        </Container>
      </header>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title="Войдите в аккаунт"
        description="Чтобы использовать эту функцию, необходимо войти в аккаунт или зарегистрироваться."
      />
    </>
  );
};
