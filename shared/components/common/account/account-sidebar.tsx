/**
 * Боковое меню навигации для личного кабинета
 * Общий компонент для всех страниц ЛК с правильной подсветкой активного пункта
 */

"use client";

import { TOAST } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
import { useSignout, useUserProfileQuery } from "@/shared/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, Shield, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export function AccountSidebar() {
  const pathname = usePathname();
  const { pendingPath, setPendingPath } = useShopNav();
  const queryClient = useQueryClient();
  const signoutMutation = useSignout();

  const effectivePath = pendingPath ?? pathname;

  // Используем useUserProfileQuery для подписки на изменения кэша
  // Благодаря staleTime: 5 минут и refetchOnMount: false, запрос НЕ будет
  // выполняться повторно, если данные уже есть в кэше
  const { data: profile, isLoading } = useUserProfileQuery();

  // Сохраняем последнее известное значение isAdmin в sessionStorage,
  // чтобы избежать мерцания при навигации между страницами ЛК
  // ВАЖНО: Инициализируем как false для SSR, затем обновляем в useEffect
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Восстанавливаем состояние из sessionStorage после гидратации
  React.useEffect(() => {
    setIsHydrated(true);
    try {
      const stored = sessionStorage.getItem("h-sport:isAdmin");
      if (stored === "true") {
        setIsAdmin(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Обновляем состояние когда есть реальные данные профиля
  React.useEffect(() => {
    if (profile?.role === "ADMIN") {
      setIsAdmin(true);
      try {
        sessionStorage.setItem("h-sport:isAdmin", "true");
      } catch {
        /* ignore */
      }
    } else if (profile !== undefined && !isLoading) {
      setIsAdmin(false);
      try {
        sessionStorage.removeItem("h-sport:isAdmin");
      } catch {
        /* ignore */
      }
    }
  }, [profile?.role, isLoading, profile]);

  // Показываем кнопку админки только после гидратации, чтобы избежать hydration mismatch
  // На сервере isAdmin всегда false, на клиенте — из sessionStorage
  const showAdminLink = isHydrated && isAdmin;

  // Оптимистичная подсветка: активный пункт по целевому пути при клике, иначе по pathname
  const isActive = (path: string) => {
    if (path === "/account") {
      return effectivePath === "/account";
    }
    return effectivePath?.startsWith(path);
  };

  const handleLinkClick = (path: string) => {
    setPendingPath(path);
  };

  // Предзагрузка данных при наведении на ссылку
  const handleMouseEnter = (path: string) => {
    if (path === "/account/orders") {
      // Предзагружаем данные заказов при наведении
      queryClient.prefetchQuery({
        queryKey: ["orders", "list"],
        queryFn: async () => {
          const { ORDER_CLIENT } = await import("@/shared/services");
          return ORDER_CLIENT.fetchOrdersList();
        },
      });
    } else if (path === "/account/favorites") {
      // Предзагружаем избранное при наведении
      queryClient.prefetchQuery({
        queryKey: ["shop", "favorites"],
        queryFn: async () => {
          const { fetchFavorites } = await import("@/shared/services");
          return fetchFavorites();
        },
      });
    }
  };

  // Обработчик выхода из аккаунта
  async function handleSignout() {
    try {
      await signoutMutation.mutateAsync();
    } catch {
      toast.error(TOAST.ERROR.SIGN_OUT);
    }
  }

  const linkBase =
    "flex items-center justify-center gap-3 rounded-lg border text-[16px] font-normal leading-[130%] cursor-pointer transition-colors w-full min-[577px]:w-auto min-[577px]:rounded-lg min-[577px]:border-0 min-[577px]:justify-start min-[577px]:px-3 min-[577px]:py-2 min-[577px]:text-left";
  const linkActive = "border-[#EB6081] bg-[#EB6081] text-white min-[577px]:bg-[#EB6081] min-[577px]:text-white";
  const linkInactive =
    "border-input bg-background hover:border-[#EB6081] hover:bg-accent min-[577px]:hover:bg-[#EB6081] min-[577px]:hover:text-white";

  return (
    <aside className="space-y-2 w-full max-w-60 max-[576px]:max-w-none">
      <h2 className="mb-6 text-[28px] font-medium max-[576px]:text-[24px] max-[576px]:mb-4 min-[768px]:text-[32px] min-[768px]:mb-6 min-[1024px]:text-[40px] min-[1024px]:mb-9.5">
        Мой профиль
      </h2>
      <nav className="space-y-1 max-[520px]:space-y-0 max-[520px]:grid max-[520px]:grid-cols-1 max-[520px]:gap-2 min-[521px]:max-[576px]:space-y-0 min-[521px]:max-[576px]:grid min-[521px]:max-[576px]:grid-cols-2 min-[521px]:max-[576px]:gap-2 min-[577px]:flex min-[577px]:flex-col">
        <Link
          href="/account"
          onClick={() => handleLinkClick("/account")}
          className={`${linkBase} h-14 min-[577px]:h-auto min-[577px]:py-2 ${
            isActive("/account") ? linkActive : linkInactive
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="truncate">Моя учетная запись</span>
        </Link>
        <Link
          href="/account/orders"
          onClick={() => handleLinkClick("/account/orders")}
          onMouseEnter={() => handleMouseEnter("/account/orders")}
          className={`${linkBase} h-14 min-[577px]:h-auto min-[577px]:py-2 ${
            isActive("/account/orders") ? linkActive : linkInactive
          }`}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span className="truncate">Мои заказы</span>
        </Link>
        <Link
          href="/account/favorites"
          onClick={() => handleLinkClick("/account/favorites")}
          onMouseEnter={() => handleMouseEnter("/account/favorites")}
          className={`${linkBase} h-14 min-[577px]:h-auto min-[577px]:py-2 ${
            isActive("/account/favorites") ? linkActive : linkInactive
          }`}
        >
          <Star className="h-4 w-4 shrink-0" />
          <span className="truncate">Избранное</span>
        </Link>
        {showAdminLink && (
          <Link
            target="_blank"
            href="/admin"
            className={`${linkBase} h-14 min-[577px]:h-auto min-[577px]:py-2 ${linkInactive}`}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="truncate">Панель администратора</span>
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignout}
          disabled={signoutMutation.isPending}
          className={`${linkBase} h-14 min-[577px]:h-auto min-[577px]:py-2 min-[577px]:text-left min-[521px]:max-[576px]:col-span-2 ${linkInactive} disabled:opacity-50`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Выйти</span>
        </button>
      </nav>
    </aside>
  );
}
