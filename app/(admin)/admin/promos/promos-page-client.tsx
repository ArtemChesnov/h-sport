"use client";

import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import {
    useAdminPromoCodesQuery,
    useCreateAdminPromoCodeMutation,
    useDeleteAdminPromoCodeMutation,
    useUpdateAdminPromoCodeMutation,
} from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib/errors";
import { DTO } from "@/shared/services";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Empty, EmptyDescription, EmptyHeader, EmptyTitle, Separator, Skeleton } from "@/shared/components/ui";
import { formatRuDate } from "../lib/promos";

import { Ticket } from "lucide-react";
import { PaginationControls } from "../components/common/pagination-controls";
import { PromoFormDialog } from "../components/promos/promo-form-dialog";
import { PromosFiltersCard } from "../components/promos/promos-filters-card";

const PromoTable = dynamic(
  () => import("../components/promos/promo-table").then((mod) => ({ default: mod.PromoTable })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
        <div className="space-y-0">
          <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-9 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

/**
 * Фильтр активности промокодов в UI.
 */
type ActiveFilter = "all" | "active" | "inactive";

export function PromosPageClient() {
  const [code, setCode] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState<number>(1);

  const queryParams = useMemo<DTO.AdminPromoCodesQueryDto>(() => {
    const p: DTO.AdminPromoCodesQueryDto = { page, perPage: 20 };
    if (code.trim()) p.code = code.trim();
    if (activeFilter === "active") p.isActive = true;
    if (activeFilter === "inactive") p.isActive = false;
    return p;
  }, [code, activeFilter, page]);

  const listQuery = useAdminPromoCodesQuery(queryParams);
  const createPromo = useCreateAdminPromoCodeMutation();
  const updatePromo = useUpdateAdminPromoCodeMutation();
  const deletePromo = useDeleteAdminPromoCodeMutation();

  const items = listQuery.data?.items ?? [];
  const meta =
    listQuery.data?.meta ??
    ({ page: 1, perPage: 20, total: 0, pages: 1 } as const);

  // Отслеживаем ID промокода, который сейчас обновляется
  const [togglingPromoId, setTogglingPromoId] = React.useState<number | undefined>(undefined);

  /**
   * Переключение активности промокода.
   */
  function handleToggleActive(
    promo: DTO.AdminPromoCodeDto,
    nextActive: boolean,
  ) {
    setTogglingPromoId(promo.id);
    updatePromo.mutate(
      { id: promo.id, payload: { isActive: nextActive } },
      {
        onSuccess: (updatedPromo) => {
          setTogglingPromoId(undefined);
          const actuallyActive = updatedPromo.isActive;

          if (nextActive === actuallyActive) {
            toast.success("Готово ✅", {
              description: nextActive
                ? `Промокод ${promo.code} включён`
                : `Промокод ${promo.code} выключен`,
            });
          } else {
            if (nextActive && !actuallyActive) {
              const endsAtStr = updatedPromo.endsAt;

              if (endsAtStr) {
                const endsAt = new Date(endsAtStr);
                const now = new Date();

                if (endsAt < now) {
                  toast.error("Не удалось включить ❌", {
                    description: `Промокод ${promo.code} не может быть включён: срок действия истёк (${formatRuDate(endsAtStr)})`,
                  });
                } else {
                  toast.error("Не удалось включить ❌", {
                    description: `Промокод ${promo.code} не может быть включён`,
                  });
                }
              } else {
                toast.error("Не удалось включить ❌", {
                  description: `Промокод ${promo.code} не может быть включён`,
                });
              }
            } else {
              toast.error("Не удалось обновить ❌", {
                description: `Промокод ${promo.code} не был обновлён`,
              });
            }
          }
        },
        onError: (e) => {
          setTogglingPromoId(undefined);
          toast.error("Не удалось обновить ❌", {
            description: getErrorMessage(e),
          });
        },
      },
    );
  }

  /**
   * Удаление промокода.
   */
  function handleDelete(promo: DTO.AdminPromoCodeDto) {
    const ok = confirm(`Удалить промокод ${promo.code}?`);
    if (!ok) return;

    deletePromo.mutate(promo.id, {
      onSuccess: () => {
        toast.success("Удалено 🗑️", {
          description: `Промокод ${promo.code} удалён`,
        });
      },
      onError: (e) => {
        toast.error("Не удалось удалить ❌", {
          description: getErrorMessage(e),
        });
      },
    });
  }

  /**
   * Создание промокода.
   * Тост показывается в PromoFormDialog после успешного создания.
   */
  async function handleCreate(payload: DTO.AdminPromoCodeCreateDto) {
    return new Promise<void>((resolve, reject) => {
      createPromo.mutate(payload, {
        onSuccess: () => {
          resolve();
        },
        onError: (e) => {
          reject(e);
        },
      });
    });
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Промокоды</h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Управление промокодами и скидками
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <PromoFormDialog
            onCreate={handleCreate}
            isCreating={createPromo.isPending}
          />
        </div>
      </header>

      <Separator />

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <div className="min-w-[600px] px-2 md:px-0">
          <PromosFiltersCard
            code={code}
            activeFilter={activeFilter}
            total={meta.total}
            onCodeChange={(value) => {
              setPage(1);
              setCode(value);
            }}
            onFilterChange={(value) => {
              setPage(1);
              setActiveFilter(value);
            }}
          />
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-amber-50/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base font-semibold">Список промокодов</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Всего {meta.total} {meta.total === 1 ? "промокод" : meta.total < 5 ? "промокода" : "промокодов"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {listQuery.isLoading ? (
            <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
              <div className="space-y-0">
                {/* Заголовок таблицы */}
                <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                {/* Строки таблицы */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
                    <Skeleton className="h-4 w-32 font-mono" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Промокодов пока нет</EmptyTitle>
                <EmptyDescription>
                  Создай первый код скидки — кнопка сверху 😉
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <PromoTable
                items={items}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                isDeleting={deletePromo.isPending}
                isToggling={updatePromo.isPending}
                togglingPromoId={togglingPromoId}
              />

              {meta.pages > 1 && (
                <div className="mt-4">
                  <PaginationControls
                    currentPage={meta.page}
                    totalPages={meta.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
