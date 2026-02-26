"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
    useAdminProductsQuery,
    useCategoriesQuery,
    useDeleteProductMutation,
} from "@/shared/hooks";
import { DTO } from "@/shared/services";

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

import { TOAST } from "@/shared/constants";
import { buildSearchString, ProductsSearchParams } from "@/shared/lib";
import { Package } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/common/breadcrumbs";
import { PaginationControls } from "../components/common/pagination-controls";
import { ProductsFiltersCard } from "../components/products/products-filters-card";

// Динамический импорт для тяжелой таблицы товаров - загружается только при необходимости
const ProductsTable = dynamic(
  () =>
    import("../components/products/products-table").then((mod) => ({ default: mod.ProductsTable })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
        <div className="space-y-0">
          <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="border-b border-border/30 h-14 flex items-center gap-4 px-4"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 ml-auto">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

type SortValue = NonNullable<DTO.ProductsQueryDto["sort"]>;
const ALLOWED_SORT: SortValue[] = ["price_asc", "price_desc", "new", "popular"];

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expandedProductIds, setExpandedProductIds] = useState<number[]>([]);

  const params = useMemo<ProductsSearchParams>(() => {
    const pageRaw = searchParams.get("page") ?? "1";
    const perPageRaw = searchParams.get("perPage") ?? "20";
    const categorySlugRaw = searchParams.get("categorySlug");
    const categorySlug: string | undefined = categorySlugRaw || undefined;
    const sortRaw = searchParams.get("sort") as DTO.ProductsQueryDto["sort"];
    const q = searchParams.get("q") || "";

    const page = Math.max(Number(pageRaw) || 1, 1);
    const perPage = Math.min(Math.max(Number(perPageRaw) || 20, 1), 100);

    const sort: SortValue = ALLOWED_SORT.includes(sortRaw as SortValue)
      ? (sortRaw as SortValue)
      : "new";

    return { page, perPage, categorySlug, sort, q };
  }, [searchParams]);

  const [searchValue, setSearchValue] = useState<string>(params.q ?? "");

  useEffect(() => {
    setSearchValue(params.q || "");
  }, [params.q]);

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategoriesQuery();

  const categories = categoriesData?.items ?? [];

  const { data, isLoading, isError } = useAdminProductsQuery({
    page: params.page,
    perPage: params.perPage,
    categorySlug: params.categorySlug,
    sort: params.sort,
    q: params.q,
  });

  const products = useMemo<DTO.AdminProductListItemDto[]>(
    () => (data?.items as DTO.AdminProductListItemDto[]) ?? [],
    [data]
  );

  const totalPages = data?.meta.pages ?? 1;
  const totalItems = data?.meta.total ?? 0;

  const deleteProductMutation = useDeleteProductMutation();

  /**
   * Удаление товара по slug (как ожидает хук/API),
   * но в confirm показываем SKU, если он известен.
   */
  const handleDeleteProduct = (payload: { slug: string; name: string; sku?: string }) => {
    const confirmed = confirm(
      `Удалить товар «${payload.name}» (${
        payload.sku ? `sku: ${payload.sku}` : `slug: ${payload.slug}`
      })? Это действие необратимо.`
    );

    if (!confirmed) return;

    deleteProductMutation.mutate(payload.slug, {
      onSuccess: () => {
        toast.success(TOAST.SUCCESS.PRODUCT_DELETED, {
          description: `«${payload.name}» успешно удалён из каталога.`,
        });
        setExpandedProductIds([]);
      },
      onError: (error) => {
        toast.error(TOAST.ERROR.FAILED_TO_DELETE_PRODUCT, {
          description: error instanceof Error ? error.message : "Попробуй ещё раз чуть позже.",
        });
      },
    });
  };

  /**
   * Debounce поиска: обновляем URL через 400мс после остановки ввода.
   */
  useEffect(() => {
    if (searchValue === params.q) return;

    // Используем setTimeout с минимальной задержкой для debounce
    const timeoutId = setTimeout(() => {
      // Используем requestIdleCallback для неблокирующего выполнения
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(() => {
          const nextParams: ProductsSearchParams = {
            ...params,
            page: 1,
            q: searchValue,
          };
          router.push(`/admin/products${buildSearchString(nextParams)}`);
          setExpandedProductIds([]);
        });
      } else {
        // Fallback для браузеров без requestIdleCallback
        requestAnimationFrame(() => {
          const nextParams: ProductsSearchParams = {
            ...params,
            page: 1,
            q: searchValue,
          };
          router.push(`/admin/products${buildSearchString(nextParams)}`);
          setExpandedProductIds([]);
        });
      }
    }, 400);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренная зависимость только от page, sort, categoryId; refetch при смене фильтров через отдельный эффект
  }, [searchValue]);

  const handleResetFilters = () => {
    const nextParams: ProductsSearchParams = {
      page: 1,
      perPage: 20,
      sort: "new",
      categorySlug: undefined,
      q: "",
    };

    setSearchValue("");
    router.push(`/admin/products${buildSearchString(nextParams)}`);
    setExpandedProductIds([]);
  };

  const handlePageChange = (nextPage: number) => {
    if (!data) return;

    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    const nextParams: ProductsSearchParams = { ...params, page: safePage };

    router.push(`/admin/products${buildSearchString(nextParams)}`);
    setExpandedProductIds([]);
  };

  const toggleProductExpanded = (productId: number) => {
    setExpandedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isEmpty = !isLoading && !isError && products.length === 0;

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <Breadcrumbs />
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Товары</h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Управление каталогом товаров
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto shrink-0"
        >
          <Link href="/admin/products/new">Новый товар</Link>
        </Button>
      </header>

      <Separator />

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <div className="min-w-150 px-2 md:px-0">
          <ProductsFiltersCard
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            categorySlug={
              Array.isArray(params.categorySlug) ? params.categorySlug[0] : params.categorySlug
            }
            sort={params.sort ?? "new"}
            categories={categories}
            isCategoriesLoading={isCategoriesLoading}
            isCategoriesError={isCategoriesError}
            onFilterChange={(nextParams) => {
              router.push(`/admin/products${buildSearchString(nextParams)}`);
              setExpandedProductIds([]);
            }}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm bg-linear-to-br from-white via-white to-teal-50/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-base font-semibold">Список товаров</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Показано {products.length} из {totalItems}{" "}
            {totalItems === 1 ? "товара" : totalItems < 5 ? "товаров" : "товаров"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
              <div className="space-y-0">
                {/* Заголовок таблицы */}
                <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                {/* Строки таблицы */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-border/30 h-14 flex items-center gap-4 px-4"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-2 ml-auto">
                      <Skeleton className="h-9 w-9 rounded" />
                      <Skeleton className="h-9 w-9 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && !isLoading && (
            <div className="text-sm text-destructive">
              Не удалось загрузить список товаров. Попробуй позже.
            </div>
          )}

          {isEmpty && (
            <div className="text-sm text-muted-foreground">
              По выбранным фильтрам товары не найдены. Попробуй изменить параметры поиска.
            </div>
          )}

          {!isLoading && !isError && !isEmpty && products.length > 0 && (
            <ProductsTable
              products={products}
              expandedProductIds={expandedProductIds}
              onToggleExpanded={toggleProductExpanded}
              onDelete={handleDeleteProduct}
              isDeleting={deleteProductMutation.isPending}
            />
          )}
        </CardContent>

        {!isLoading && !isError && data && totalPages > 1 && (
          <CardFooter className="border-t border-border pt-4">
            <PaginationControls
              currentPage={data.meta.page}
              totalPages={data.meta.pages}
              onPageChange={handlePageChange}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
