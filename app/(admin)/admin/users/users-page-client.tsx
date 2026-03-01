"use client";

import { TOAST } from "@/shared/constants";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { useAdminUsersQuery } from "@/shared/hooks";
import type * as DTO from "@/shared/services/dto";
import { Users } from "lucide-react";
import { PaginationControls } from "../components/common/pagination-controls";
import { SearchFilterCard } from "../components/common/search-filter-card";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/shared/components/ui";

const UsersTable = dynamic(
  () => import("../components/users/users-table").then((mod) => ({ default: mod.UsersTable })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
        <div className="space-y-0">
          <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

/**
 * Читаем параметры из URL.
 */
function readParams(sp: ReturnType<typeof useSearchParams>): DTO.AdminUsersQueryDto {
  const page = Number(sp.get("page") ?? "1") || 1;
  const perPage = Number(sp.get("perPage") ?? "20") || 20;
  const searchRaw = (sp.get("search") ?? "").trim();

  return {
    page: Math.max(1, page),
    perPage: Math.min(Math.max(1, perPage), 100),
    search: searchRaw.length > 0 ? searchRaw : undefined,
  };
}

/**
 * DTO → query-string.
 */
function buildSearchString(params: DTO.AdminUsersQueryDto): string {
  const sp = new URLSearchParams();

  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.perPage && params.perPage !== 20) sp.set("perPage", String(params.perPage));
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function UsersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Истина для запроса — параметры из URL
  const urlParams = React.useMemo(() => readParams(searchParams), [searchParams]);
  const urlSearch = (urlParams.search ?? "").trim();

  // Инпут: локальный state, чтобы печатать свободно
  const [searchValue, setSearchValue] = React.useState<string>(urlSearch);

  // Синхронизация инпута при back/forward или внешних изменениях URL
  React.useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  // Debounce для живого поиска
  const [debounced, setDebounced] = React.useState<string>(urlSearch);

  React.useEffect(() => {
    // Оптимизируем выполнение для неблокирующего обновления
    const id = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(() => {
          setDebounced(searchValue.trim());
        });
      } else {
        requestAnimationFrame(() => {
          setDebounced(searchValue.trim());
        });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchValue]);

  // Когда debounced изменился — обновляем URL (replace, чтобы не засорять историю)
  React.useEffect(() => {
    const nextSearch = debounced.trim();
    const currentSearch = urlSearch;

    if (nextSearch === currentSearch) return;

    const nextParams: DTO.AdminUsersQueryDto = {
      ...urlParams,
      page: 1, // при смене поиска — сбрасываем страницу
      search: nextSearch.length > 0 ? nextSearch : undefined,
    };

    router.replace(`/admin/users${buildSearchString(nextParams)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренная зависимость только от page; refetch при смене поиска через отдельный эффект
  }, [debounced, urlSearch]);

  // Запрос строго по URL-параметрам
  const { data, isLoading, isError, error } = useAdminUsersQuery(urlParams);

  React.useEffect(() => {
    if (!isError) return;
    toast.error(TOAST.ERROR.LOAD_USERS, {
      description: error instanceof Error ? error.message : "Неизвестная ошибка",
    });
  }, [isError, error]);

  const items: DTO.AdminUserListItemDto[] = data?.items ?? [];
  const totalPages = data?.meta.pages ?? 1;
  const currentPage = data?.meta.page ?? urlParams.page ?? 1;

  const handleClearSearch = () => {
    setSearchValue("");
    const nextParams: DTO.AdminUsersQueryDto = {
      ...urlParams,
      page: 1,
      search: undefined,
    };
    router.replace(`/admin/users${buildSearchString(nextParams)}`);
  };

  const handlePageChange = (nextPage: number) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages);
    const nextParams: DTO.AdminUsersQueryDto = { ...urlParams, page: safe };
    router.push(`/admin/users${buildSearchString(nextParams)}`);
  };

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <header>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Управление клиентами магазина
          </p>
        </div>
      </header>

      <Separator />

      {/* Поиск (живой) */}
      <div className="overflow-x-auto -mx-2 md:mx-0">
        <div className="min-w-[600px] px-2 md:px-0">
          <SearchFilterCard
            title="Поиск"
            description="Поиск по ФИО, email или номеру телефона."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Поиск..."
          >
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={handleClearSearch}
              disabled={searchValue.trim().length === 0}
            >
              Очистить
            </Button>
          </SearchFilterCard>
        </div>
      </div>

      {/* Загрузка */}
      {isLoading && (
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-slate-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
              <div className="space-y-0">
                {/* Заголовок таблицы */}
                <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
                {/* Строки таблицы */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-border/30 h-14 flex items-center gap-4 px-4"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-9 rounded ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица */}
      {data && (
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-slate-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-base font-semibold">Список пользователей</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Найдено {data.meta.total}{" "}
              {data.meta.total === 1
                ? "пользователь"
                : data.meta.total < 5
                  ? "пользователя"
                  : "пользователей"}{" "}
              · страница {data.meta.page} из {data.meta.pages}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <UsersTable users={items} />
          </CardContent>

          {/* Пагинация */}
          {data.meta.pages > 1 && (
            <CardFooter className="border-t pt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
