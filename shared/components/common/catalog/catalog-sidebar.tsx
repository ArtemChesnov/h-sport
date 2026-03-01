/**
 * Фасад для сайдбара каталога
 *
 * Рефакторинг: код разбит на модули:
 * - use-catalog-filters.ts - хук для управления фильтрами
 * - catalog-category-filter.tsx - фильтр по категориям
 * - catalog-price-filter.tsx - фильтр по цене
 * - catalog-color-filter.tsx - фильтр по цвету
 * - catalog-size-filter.tsx - фильтр по размеру
 *
 * Этот компонент собирает все подкомпоненты фильтров
 */

"use client";

import React from "react";
import { useCategoriesQuery, useCatalogFiltersQuery } from "@/shared/hooks";
import { COLOR_PRESETS } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { Check, X } from "lucide-react";
import { useCatalogFilters } from "./use-catalog-filters";
import { CatalogCategoryFilter } from "./catalog-category-filter";
import { CatalogPriceFilter } from "./catalog-price-filter";
import { CatalogColorFilter } from "./catalog-color-filter";
import { CatalogSizeFilter } from "./catalog-size-filter";

export type CatalogSidebarApplyMode = "immediate" | "onApply";

type CatalogSidebarProps = {
  className?: string;
  productsLoading?: boolean;
  /** На мобилках: "onApply" — фильтры применяются по кнопке «Применить»; "immediate" — сразу (десктоп). */
  applyMode?: CatalogSidebarApplyMode;
  /** Колбэк после применения фильтров (например закрыть панель на мобилке). */
  onApplyFilters?: () => void;
};

const CatalogSidebarComponent = ({
  className,
  productsLoading,
  applyMode = "immediate",
  onApplyFilters,
}: CatalogSidebarProps) => {
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategoriesQuery();
  const {
    data: filtersData,
    isLoading: isFiltersLoading,
    isError: isFiltersError,
  } = useCatalogFiltersQuery();

  const isLoading = isCategoriesLoading || isFiltersLoading || productsLoading;
  const hasFiltersError = isFiltersError || isCategoriesError;
  const applyImmediately = applyMode === "immediate";

  const {
    currentCategories,
    currentSizes,
    currentColors,
    currentPriceFrom,
    currentPriceTo,
    handleCategoryToggle,
    handleSizeToggle,
    handleColorToggle,
    updateFilters,
    applyFilters,
    setPendingPrice,
    clearFilters,
    hasActiveFilters,
  } = useCatalogFilters(applyImmediately);

  // Получаем категории - показываем все категории из API (сортировка по копии, без мутации кэша React Query)
  const categoriesWithProducts = React.useMemo(() => {
    const allCategoriesFromAPI = categoriesData?.items ?? [];
    if (allCategoriesFromAPI.length === 0) return [];
    return [...allCategoriesFromAPI].sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name)
    );
  }, [categoriesData?.items]);

  // Получаем все доступные цвета из endpoint фильтров, используя COLOR_PRESETS
  const allColors = React.useMemo(() => {
    if (!filtersData?.colors) return [];
    const colorSet = new Set<string>();
    filtersData.colors.forEach((color: string) => {
      const trimmed = color.trim();
      if (trimmed) {
        const preset = COLOR_PRESETS.find((p) => p.value.toLowerCase() === trimmed.toLowerCase());
        if (preset) {
          colorSet.add(preset.value);
        } else {
          colorSet.add(trimmed);
        }
      }
    });
    const sortedColors = Array.from(colorSet).sort((a, b) => {
      const indexA = COLOR_PRESETS.findIndex((p) => p.value === a);
      const indexB = COLOR_PRESETS.findIndex((p) => p.value === b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sortedColors;
  }, [filtersData]);

  // Получаем диапазон цен из endpoint фильтров (с fallback)
  const priceRange = React.useMemo(() => {
    if (!filtersData?.priceRange || isFiltersError) {
      return { min: 0, max: 120000 };
    }
    return filtersData.priceRange;
  }, [filtersData, isFiltersError]);

  // Показываем предупреждение если не удалось загрузить фильтры
  if (hasFiltersError && !isLoading) {
    return (
      <aside className={cn("w-full shrink-0 lg:w-[258px]", className)}>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Не удалось загрузить фильтры. Попробуйте обновить страницу.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn("w-full shrink-0 lg:w-[258px]", className)}>
      <CatalogCategoryFilter
        categories={categoriesWithProducts}
        selectedCategories={currentCategories}
        onToggle={handleCategoryToggle}
        isLoading={isLoading}
      />

      <div
        className={cn("mb-6", isLoading ? "mt-8" : categoriesWithProducts.length > 5 ? "mt-8" : "")}
      >
        {isLoading ? (
          <div className="h-[33px] w-24 bg-accent animate-pulse rounded" />
        ) : (
          <h3 className="font-heading text-[22px] font-medium text-[#1f1e1e]">Фильтры</h3>
        )}
      </div>

      <CatalogPriceFilter
        priceRange={priceRange}
        currentPriceFrom={currentPriceFrom}
        currentPriceTo={currentPriceTo}
        onPriceChange={
          applyImmediately
            ? (priceFrom, priceTo) => updateFilters({ priceFrom, priceTo }, priceRange)
            : (priceFrom, priceTo) => setPendingPrice(priceFrom, priceTo)
        }
        isLoading={isLoading}
      />

      <div className="h-px bg-[#D8DAD9] my-[18px]" />

      <CatalogColorFilter
        colors={allColors}
        selectedColors={currentColors}
        onToggle={handleColorToggle}
        isLoading={isLoading}
      />

      <div
        className={cn(
          "h-px bg-[#D8DAD9]",
          allColors.length > 5 ? "my-[18px]" : "mt-[18px] mb-[18px]"
        )}
      />

      <CatalogSizeFilter
        availableSizes={filtersData?.sizes}
        selectedSizes={currentSizes}
        onToggle={handleSizeToggle}
        isLoading={isLoading}
      />

      {/* Кнопка сброса фильтров */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            clearFilters(priceRange);
            if (applyMode === "onApply") onApplyFilters?.();
          }}
          className="w-full px-4 py-2 mt-6 text-base font-light text-[#EB6081] border border-[#EB6081] rounded-lg hover:bg-[#EB6081] hover:text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <X className="h-4 w-4" />
          Сбросить фильтры
        </button>
      )}

      {/* На мобилках: применить фильтры по кнопке */}
      {applyMode === "onApply" && (
        <button
          type="button"
          onClick={() => {
            applyFilters(priceRange);
            onApplyFilters?.();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#EB6081" }}
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Применить
        </button>
      )}
    </aside>
  );
};

CatalogSidebarComponent.displayName = "CatalogSidebar";

export const CatalogSidebar = React.memo(CatalogSidebarComponent);
