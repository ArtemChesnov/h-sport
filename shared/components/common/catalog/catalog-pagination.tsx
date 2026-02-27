"use client";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { DTO } from "@/shared/services";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface CatalogPaginationProps {
  meta: DTO.PaginationMetaDto;
  className?: string;
}

/**
 * Генерирует массив номеров страниц для отображения с эллипсисами
 * Показывает: первую, последнюю, текущую и соседние страницы
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const delta = 1; // Количество страниц по бокам от текущей

  // Всегда показываем первую страницу
  pages.push(1);

  // Вычисляем диапазон страниц вокруг текущей
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  // Добавляем эллипсис если есть пропуск после первой страницы
  if (rangeStart > 2) {
    pages.push("ellipsis");
  }

  // Добавляем страницы в диапазоне
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Добавляем эллипсис если есть пропуск перед последней страницей
  if (rangeEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  // Всегда показываем последнюю страницу (если их больше одной)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Компонент пагинации для каталога товаров
 *
 * Отображает номера страниц с эллипсисами, кнопки "Назад" и "Вперёд".
 * При клике обновляет query-параметр `page` в URL без полной перезагрузки страницы.
 */
export function CatalogPagination({ meta, className }: CatalogPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Вычисляем hasNext и hasPrev из meta (для обратной совместимости)
  const hasNext = meta.hasNext ?? meta.page < meta.pages;
  const hasPrev = meta.hasPrev ?? meta.page > 1;

  // Функция для обновления страницы в URL
  const updatePage = React.useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newPage === 1) {
        // Убираем параметр page для первой страницы (чистый URL)
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }

      // Прокручиваем к началу каталога при смене страницы
      const newUrl = `/catalog${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(newUrl);

      // Прокрутка к началу блока каталога (не к самому верху документа)
      setTimeout(() => {
        const catalogSection = document.querySelector("[data-catalog-section]");
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    [searchParams, router]
  );

  const handlePrev = () => {
    if (hasPrev && meta.page > 1) {
      updatePage(meta.page - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && meta.page < meta.pages) {
      updatePage(meta.page + 1);
    }
  };

  // Не показываем пагинацию, если всего одна страница
  if (meta.pages <= 1) {
    return null;
  }

  // Генерируем номера страниц
  const pageNumbers = generatePageNumbers(meta.page, meta.pages);

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8 pb-8", className)}>
      {/* Кнопка "Назад" */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={!hasPrev}
        aria-label="Предыдущая страница"
        className="rounded-[6px] font-light"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Назад</span>
      </Button>

      {/* Номера страниц */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-neutral-400"
                aria-hidden="true"
              >
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

      {/* Кнопка "Вперёд" */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleNext}
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
