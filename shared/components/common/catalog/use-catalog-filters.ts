/**
 * Хук для управления фильтрами каталога
 * @param applyImmediately — при true (десктоп) фильтры применяются сразу; при false (мобилка) только по кнопке «Применить»
 */

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DTO } from "@/shared/services";

const defaultPriceFrom: number | undefined = undefined;
const defaultPriceTo: number | undefined = undefined;

export function useCatalogFilters(applyImmediately = true) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Читаем текущие параметры из URL
  const urlCategories = searchParams.getAll("categorySlug");
  const urlPriceFrom = searchParams.get("priceFrom")
    ? Number(searchParams.get("priceFrom"))
    : undefined;
  const urlPriceTo = searchParams.get("priceTo") ? Number(searchParams.get("priceTo")) : undefined;
  const urlSizes = searchParams.getAll("size") as DTO.SizeDto[];
  const urlColors = searchParams.getAll("color");

  // Оптимистичное состояние для мгновенной визуальной обратной связи чекбоксов
  const [pendingCategories, setPendingCategories] = React.useState<string[] | null>(null);
  const [pendingSizes, setPendingSizes] = React.useState<DTO.SizeDto[] | null>(null);
  const [pendingColors, setPendingColors] = React.useState<string[] | null>(null);
  const [pendingPriceFrom, setPendingPriceFrom] = React.useState<number | undefined>(
    defaultPriceFrom
  );
  const [pendingPriceTo, setPendingPriceTo] = React.useState<number | undefined>(defaultPriceTo);

  // Используем оптимистичное состояние для визуальной обратной связи
  const currentCategories = pendingCategories ?? urlCategories;
  const currentSizes = pendingSizes ?? urlSizes;
  const currentColors = pendingColors ?? urlColors;
  const currentPriceFrom = pendingPriceFrom ?? urlPriceFrom;
  const currentPriceTo = pendingPriceTo ?? urlPriceTo;

  // Стабильные ключи для зависимостей useEffect (сортировка по копии, без мутации)
  const categoriesKey = React.useMemo(() => [...urlCategories].sort().join(","), [urlCategories]);
  const sizesKey = React.useMemo(() => [...urlSizes].sort().join(","), [urlSizes]);
  const colorsKey = React.useMemo(() => [...urlColors].sort().join(","), [urlColors]);
  const priceKey = `${urlPriceFrom ?? ""}-${urlPriceTo ?? ""}`;

  // Синхронизируем оптимистичное состояние с URL при его обновлении
  React.useEffect(() => {
    setPendingCategories(null);
    setPendingSizes(null);
    setPendingColors(null);
    setPendingPriceFrom(undefined);
    setPendingPriceTo(undefined);
  }, [categoriesKey, sizesKey, colorsKey, priceKey]);

  // Функция для обновления фильтров (без прокрутки в начало)
  const updateFilters = React.useCallback(
    (
      updates: Partial<{
        categorySlug?: string[];
        priceFrom?: number;
        priceTo?: number;
        size?: DTO.SizeDto[];
        color?: string[];
      }>,
      priceRange?: { min: number; max: number }
    ) => {
      // Оптимизация: используем startTransition для неблокирующих обновлений
      React.startTransition(() => {
        const queryParams = new URLSearchParams();

        // Сохраняем существующие параметры
        const perPage = searchParams.get("perPage");
        if (perPage) {
          queryParams.set("perPage", perPage);
        }

        const sort = searchParams.get("sort");
        if (sort) {
          queryParams.set("sort", sort);
        }

        // Применяем фильтры (используем значения из updates, иначе из URL)
        const categories =
          updates.categorySlug !== undefined ? updates.categorySlug : urlCategories;
        const sizes = updates.size !== undefined ? updates.size : urlSizes;
        const priceFrom = updates.priceFrom !== undefined ? updates.priceFrom : currentPriceFrom;
        const priceTo = updates.priceTo !== undefined ? updates.priceTo : currentPriceTo;
        const colors = updates.color !== undefined ? updates.color : urlColors;

        // Добавляем категории
        categories.forEach((slug) => {
          queryParams.append("categorySlug", slug);
        });

        // Добавляем размеры
        sizes.forEach((size) => {
          queryParams.append("size", size);
        });

        // Добавляем цену (только если отличается от диапазона)
        if (priceRange) {
          if (priceFrom !== undefined && priceFrom !== priceRange.min) {
            queryParams.set("priceFrom", String(priceFrom));
          }
          if (priceTo !== undefined && priceTo !== priceRange.max) {
            queryParams.set("priceTo", String(priceTo));
          }
        } else {
          if (priceFrom !== undefined) {
            queryParams.set("priceFrom", String(priceFrom));
          }
          if (priceTo !== undefined) {
            queryParams.set("priceTo", String(priceTo));
          }
        }

        // Добавляем цвета (множественные)
        colors.forEach((c) => {
          queryParams.append("color", c);
        });

        // Всегда сбрасываем на первую страницу при изменении фильтров
        queryParams.set("page", "1");

        const queryStr = queryParams.toString();
        const url = `/catalog${queryStr ? `?${queryStr}` : ""}`;

        // Используем только router.replace с scroll: false
        // Это предотвращает двойное обновление и дёргание страницы
        router.replace(url, { scroll: false });
      });
    },
    [searchParams, urlCategories, urlSizes, urlColors, currentPriceFrom, currentPriceTo, router]
  );

  const handleCategoryToggle = React.useCallback(
    (slug: string) => {
      const newCategories = currentCategories.includes(slug)
        ? currentCategories.filter((c) => c !== slug)
        : [...currentCategories, slug];
      setPendingCategories(newCategories);
      if (applyImmediately) {
        updateFilters({ categorySlug: newCategories });
      }
    },
    [currentCategories, updateFilters, applyImmediately]
  );

  const handleSizeToggle = React.useCallback(
    (size: DTO.SizeDto) => {
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size)
        : [...currentSizes, size];
      setPendingSizes(newSizes);
      if (applyImmediately) {
        updateFilters({ size: newSizes });
      }
    },
    [currentSizes, updateFilters, applyImmediately]
  );

  const handleColorToggle = React.useCallback(
    (color: string) => {
      const newColors = currentColors.includes(color)
        ? currentColors.filter((c) => c !== color)
        : [...currentColors, color];
      setPendingColors(newColors);
      if (applyImmediately) {
        updateFilters({ color: newColors });
      }
    },
    [currentColors, updateFilters, applyImmediately]
  );

  /** Применить текущие (в т.ч. отложенные) фильтры в URL. Для мобилки по кнопке «Применить». */
  const applyFilters = React.useCallback(
    (priceRange?: { min: number; max: number }) => {
      updateFilters(
        {
          categorySlug: currentCategories,
          size: currentSizes,
          color: currentColors,
          priceFrom: currentPriceFrom,
          priceTo: currentPriceTo,
        },
        priceRange
      );
    },
    [
      updateFilters,
      currentCategories,
      currentSizes,
      currentColors,
      currentPriceFrom,
      currentPriceTo,
    ]
  );

  /** Только обновить отложенные значения цены (для мобилки без немедленного применения). */
  const setPendingPrice = React.useCallback((from: number | undefined, to: number | undefined) => {
    setPendingPriceFrom(from);
    setPendingPriceTo(to);
  }, []);

  const clearFilters = React.useCallback(
    (_priceRange?: { min: number; max: number }) => {
      setPendingCategories([]);
      setPendingSizes([]);
      setPendingColors([]);
      setPendingPriceFrom(undefined);
      setPendingPriceTo(undefined);
      router.replace("/catalog", { scroll: false });
    },
    [router]
  );

  const hasActiveFilters =
    currentCategories.length > 0 ||
    currentPriceFrom ||
    currentPriceTo ||
    currentSizes.length > 0 ||
    currentColors.length > 0;

  return {
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
    applyImmediately,
  };
}
