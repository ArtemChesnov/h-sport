
"use client";

import { AdminErrorBoundary } from "@/shared/components/error-boundaries";
import { Spinner } from "@/shared/components/ui";
import { useAuthCheck, useUserProfileQuery } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { AdminSidebar } from "./components/admin-sidebar";
import { AdminContentSkeleton } from "./components/common/admin-content-skeleton";
import { GlobalSearch } from "./components/common/global-search";
import { AdminNavProvider, useAdminNav } from "./context/admin-nav-context";

type AdminLayoutProps = {
  children: React.ReactNode;
};

/**
 * Общий layout панели администратора.
 * Защищает админку от неавторизованных пользователей и проверяет роль админа.
 */
export default function AdminLayout(props: AdminLayoutProps) {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();

  // Используем useUserProfileQuery для подписки на изменения кэша
  // Благодаря staleTime: 5 минут и refetchOnMount: false, запрос НЕ будет
  // выполняться повторно, если данные уже есть в кэше
  const { data: profile, isLoading: isProfileLoading } = useUserProfileQuery();

  // Редирект на страницу авторизации если не авторизован
  // Выполняем только после завершения загрузки
  const hasRedirectedAuth = React.useRef(false);
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !hasRedirectedAuth.current) {
      hasRedirectedAuth.current = true;
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Редирект на главную если не админ
  // Выполняем только после завершения загрузки и получения профиля
  const hasRedirectedRole = React.useRef(false);
  React.useEffect(() => {
    if (
      !isProfileLoading &&
      isAuthenticated &&
      profile &&
      profile.role !== "ADMIN" &&
      !hasRedirectedRole.current
    ) {
      hasRedirectedRole.current = true;
      router.push("/");
    }
  }, [profile, isAuthenticated, isProfileLoading, router]);

  // Показываем загрузку пока идет проверка авторизации или загрузка профиля
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Если не авторизован - показываем спиннер пока идет редирект
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Если не админ - показываем спиннер пока идет редирект
  if (!profile || profile.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AdminNavProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminNavProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isNavigating } = useAdminNav();

  return (
    <div className="admin min-h-screen bg-background text-foreground font-sans">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-white via-white to-slate-50/30 px-2 py-2.5 sm:px-3 sm:py-3 md:px-6 md:py-4 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block truncate">
                Панель управления
              </span>
              {isNavigating && (
                <Spinner className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-1 sm:flex-initial justify-end min-w-0">
              <GlobalSearch />
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Перейти на сайт (открывается в новой вкладке)"
                title="Перейти на сайт"
                className="flex items-center gap-1 sm:gap-2 rounded-lg border border-border/50 bg-gradient-to-r from-white to-slate-50/50 px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-3 md:py-2 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 hover:text-foreground hover:border-indigo-200/50 shadow-sm shrink-0"
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span className="hidden md:inline">Сайт</span>
              </a>
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shadow-sm"></div>
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground hidden md:inline">Администратор</span>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-gradient-to-br from-slate-50/30 via-white to-white">
            <AdminErrorBoundary>
              <div className="mx-auto max-w-7xl px-2 sm:px-3 md:px-0">
                <Suspense fallback={<AdminContentSkeleton />}>{children}</Suspense>
              </div>
            </AdminErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
