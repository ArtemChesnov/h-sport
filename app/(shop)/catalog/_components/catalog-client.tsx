/**
 * Клиентская часть каталога
 * Отвечает за интерактивность: фильтры, сортировка, переключение вида
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";

import {
  CatalogPagination,
  CatalogSortButton,
  Container,
  ShopBreadcrumbs,
  type ViewMode,
  ViewToggle,
} from "@/shared/components/common";
import { CatalogSidebar } from "@/shared/components/common/catalog/catalog-sidebar";
import { ProductList } from "@/shared/components/common/product/product-list";
import { ShopErrorBoundary } from "@/shared/components/error-boundaries";
import { CTA } from "@/shared/constants";
import { useProductsQuery } from "@/shared/hooks";
import { hasActiveFilters, parseCatalogQuery, toProductsQueryDto } from "@/shared/lib/catalog";
import { DTO } from "@/shared/services";

interface CatalogClientProps {
  /** Начальные данные товаров (SSR) */
  initialProducts?: DTO.ProductListItemDto[];
  /** Начальные метаданные пагинации */
  initialMeta?: DTO.PaginationMetaDto;
}

/**
 * Хук для парсинга query-параметров каталога
 * Использует общий парсер из shared/lib/catalog
 */
function useCatalogQueryParams() {
  const searchParams = useSearchParams();

  return React.useMemo(() => {
    const parsed = parseCatalogQuery(searchParams);
    return {
      query: toProductsQueryDto(parsed),
      hasFilters: hasActiveFilters(parsed),
    };
  }, [searchParams]);
}

const CatalogClientComponent = ({ initialProducts, initialMeta }: CatalogClientProps) => {
  const { query, hasFilters } = useCatalogQueryParams();
  const queryClient = useQueryClient();

  // Используем начальные данные только если нет фильтров
  const shouldUseInitialData = !hasFilters && query.page === undefined;
  const hasInitialData = shouldUseInitialData && initialProducts && initialMeta;

  const { data, isLoading, isFetching, isError, refetch } = useProductsQuery(query, {
    // Используем SSR данные как initialData только для первой страницы без фильтров
    initialData: hasInitialData ? { items: initialProducts, meta: initialMeta } : undefined,
  });

  // Режим отображения - локальное состояние (без URL для быстрого переключения)
  const [viewMode, setViewMode] = React.useState<ViewMode>("mosaic");
  // На экранах ≤768px: открыта ли панель фильтров по кнопке «Фильтры»
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Определяем реальное состояние загрузки: isLoading только если нет данных вообще
  // Используем initialProducts напрямую при первом рендере, чтобы избежать мисмэтча гидратации
  const products = data?.items ?? (hasInitialData ? initialProducts : undefined);
  const meta = data?.meta ?? (hasInitialData ? initialMeta : undefined);
  const hasData = !!products;
  const actualIsLoading = isLoading && !hasData;

  // При переходе на каталог (с главной «Смотреть все» и т.д.) всегда открывать с начала страницы
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (meta && meta.page < meta.pages) {
      const nextPage = meta.page + 1;
      const nextQuery = {
        ...query,
        page: nextPage,
      };
      // Prefetch через React Query для предзагрузки данных следующей страницы
      import("@/shared/services").then(({ PRODUCT_CLIENT }) => {
        queryClient.prefetchQuery({
          queryKey: ["products", JSON.stringify(nextQuery)],
          queryFn: () => PRODUCT_CLIENT.fetchProducts(nextQuery),
        });
      });
    }
  }, [meta, query, queryClient]);

  return (
    <ShopErrorBoundary>
      <Container>
        <section>
          <ShopBreadcrumbs />
          <h1 className="sr-only">Каталог</h1>
        </section>

        {/* layout каталога */}
        <div className="mt-[60px] flex flex-col gap-8 lg:flex-row" data-catalog-section>
          {/* Левое меню - фильтры: от 768px сайдбар, до 768px кнопка «Фильтры» + раскрывающаяся панель */}
          <div className="w-full shrink-0 lg:w-[258px]">
            <div className="hidden md:block">
              <CatalogSidebar productsLoading={actualIsLoading} />
            </div>
            <div className="md:hidden">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#EB6081" }}
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                aria-controls="catalog-filters-panel"
                id="catalog-filters-toggle"
              >
                <Filter className="h-4 w-4 shrink-0" aria-hidden />
                Фильтры
              </button>
              <div
                id="catalog-filters-panel"
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: filtersOpen ? "1fr" : "0fr" }}
                aria-hidden={!filtersOpen}
              >
                <div className="min-h-0 overflow-hidden pt-4">
                  <CatalogSidebar
                    productsLoading={actualIsLoading}
                    applyMode="onApply"
                    onApplyFilters={() => setFiltersOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка с сортировкой и товарами */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex items-center justify-between">
              <CatalogSortButton />
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                className="hidden min-[410px]:flex"
              />
            </div>
            <ProductList
              products={products}
              isLoading={actualIsLoading}
              isFetching={isFetching}
              isError={isError}
              onErrorRetry={() => refetch()}
              emptyText="Товары не найдены"
              errorText="Попробуй обновить страницу чуть позже."
              emptyAction={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
              viewMode={viewMode}
            />
            {/* Пагинация */}
            {meta && <CatalogPagination meta={meta} />}
          </div>
        </div>
      </Container>
    </ShopErrorBoundary>
  );
};

CatalogClientComponent.displayName = "CatalogClient";

export const CatalogClient = React.memo(CatalogClientComponent);
