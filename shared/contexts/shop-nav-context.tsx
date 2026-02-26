"use client";

import { ContentLoader } from "@/shared/components/ui";
import { usePathname } from "next/navigation";
import React from "react";

type ShopNavContextValue = {
  pendingPath: string | null;
  setPendingPath: (path: string | null) => void;
  isNavigating: boolean;
};

const ShopNavContext = React.createContext<ShopNavContextValue | null>(null);

/**
 * Провайдер навигации магазина: перехватывает клики по внутренним ссылкам,
 * показывает глобальный оверлей-лоадер при любом переходе между страницами.
 */
export function ShopNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingPath, setPendingPathState] = React.useState<string | null>(null);
  const setPendingPathRef = React.useRef<(path: string | null) => void>(() => {});
  const prevPathnameRef = React.useRef<string>(pathname);

  const setPendingPath = React.useCallback((path: string | null) => {
    setPendingPathState(path);
  }, []);

  React.useEffect(() => {
    setPendingPathRef.current = setPendingPath;
  }, [setPendingPath]);

  // Сбрасываем лоадер при любом изменении pathname (в т.ч. редирект с /auth на /account и т.д.)
  React.useEffect(() => {
    if (pendingPath == null) return;
    if (pathname !== prevPathnameRef.current) {
      setPendingPathState(null);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, pendingPath]);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Игнорируем клики по кнопкам и интерактивным элементам внутри ссылки
      // (например, FavoriteToggleButton — иначе показывается лоадер вместо перехода по карточке)
      if (target.closest("button, [role='button'], input, select, textarea")) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download"))
        return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      const path = href.split("?")[0].split("#")[0];
      if (path === pathname || pathname.startsWith(path + "/")) return;
      setPendingPathRef.current(path);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  const isNavigating = pendingPath != null;

  const value: ShopNavContextValue = {
    pendingPath,
    setPendingPath,
    isNavigating,
  };

  return (
    <ShopNavContext.Provider value={value}>
      {children}
      {isNavigating && <ContentLoader variant="overlay" />}
    </ShopNavContext.Provider>
  );
}

export function useShopNav() {
  const ctx = React.useContext(ShopNavContext);
  if (!ctx) {
    return {
      pendingPath: null,
      setPendingPath: () => {},
      isNavigating: false,
    };
  }
  return ctx;
}
