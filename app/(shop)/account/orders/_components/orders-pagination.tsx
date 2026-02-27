"use client";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { DTO } from "@/shared/services";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface OrdersPaginationProps {
  meta: DTO.PaginationMetaDto;
  className?: string;
}

function generatePageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const delta = 1;

  pages.push(1);
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  if (rangeStart > 2) pages.push("ellipsis");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

/**
 * Пагинация для страницы "Мои заказы" в ЛК.
 * Стиль как в каталоге (variant outline).
 */
export function OrdersPagination({ meta, className }: OrdersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasNext = meta.hasNext ?? meta.page < meta.pages;
  const hasPrev = meta.hasPrev ?? meta.page > 1;

  const updatePage = React.useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const query = params.toString();
      router.push(`/account/orders${query ? `?${query}` : ""}`);

      setTimeout(() => {
        const section = document.querySelector("[data-orders-section]");
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [searchParams, router]
  );

  if (meta.pages <= 1) return null;

  const pageNumbers = generatePageNumbers(meta.page, meta.pages);

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8 pb-8", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(meta.page - 1)}
        disabled={!hasPrev}
        aria-label="Предыдущая страница"
        className="rounded-[6px] font-light"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Назад</span>
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-neutral-400" aria-hidden>
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }
          const isCurrentPage = pageNum === meta.page;
          return (
            <Button
              key={pageNum}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updatePage(pageNum)}
              disabled={isCurrentPage}
              aria-label={`Страница ${pageNum}`}
              aria-current={isCurrentPage ? "page" : undefined}
              className={cn(
                "min-w-[36px] h-9 px-2 rounded-[6px] font-light",
                isCurrentPage && "bg-primary/10 border-primary text-primary pointer-events-none"
              )}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => updatePage(meta.page + 1)}
        disabled={!hasNext}
        aria-label="Следующая страница"
        className="rounded-[6px] font-light"
      >
        <span className="hidden sm:inline">Вперёд</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
