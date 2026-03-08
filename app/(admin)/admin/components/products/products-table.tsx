"use client";

import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui";
import { TOAST } from "@/shared/constants";
import { useCopyToClipboard } from "@/shared/hooks/common/use-copy-to-clipboard";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/shared/lib/constants/images";
import { DTO } from "@/shared/services";
import { CheckCircle2, ChevronDown, Copy, Settings, Trash2, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { formatPrice, getPriceLabel } from "../../lib/utils";

// Динамический импорт для ProductVariantsTable - загружается только при раскрытии строки
const ProductVariantsTable = dynamic(
  () => import("./product-variants-table").then((mod) => ({ default: mod.ProductVariantsTable })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2 p-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    ),
  }
);

type ProductRow = DTO.AdminProductListItemDto | DTO.ProductListItemDto;

/**
 * Безопасно достаёт SKU из строки таблицы.
 */
function getRowSku(row: ProductRow): string | undefined {
  if (!("sku" in row)) return undefined;

  const sku = row.sku;
  if (typeof sku !== "string") return undefined;

  const trimmed = sku.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type ProductsTableProps = {
  products: ProductRow[];
  expandedProductIds: number[];
  onToggleExpanded: (productId: number) => void;
  onDelete: (payload: { slug: string; name: string; sku?: string }) => void;
  isDeleting: boolean;
};

/**
 * Таблица товаров с возможностью раскрытия вариантов.
 */
export function ProductsTable(props: ProductsTableProps) {
  const { products, expandedProductIds, onToggleExpanded, onDelete, isDeleting } = props;
  const { copyToClipboard } = useCopyToClipboard({
    successMessage: TOAST.SUCCESS.SKU_COPIED,
    errorMessage: TOAST.ERROR.FAILED_TO_COPY,
  });

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background -mx-2 md:mx-0">
      <div className="min-w-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/50">
              <TableHead className="w-20 font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Фото
              </TableHead>
              <TableHead className="w-15 font-semibold text-xs h-12 align-middle pl-4 pr-4">
                ID
              </TableHead>
              <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Название
              </TableHead>
              <TableHead className="font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Категория
              </TableHead>
              <TableHead className="text-right font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Цена
              </TableHead>
              <TableHead className="text-center font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Статус
              </TableHead>
              <TableHead className="text-right font-semibold text-xs h-12 align-middle pl-4 pr-4">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((product) => {
              const { id, slug, name, categoryName } = product;
              const sku = getRowSku(product);

              const hasAdminPrice = "priceMin" in product || "priceMax" in product;
              const hasStorefrontPrice = "price" in product;

              let priceLabel = "—";
              if (hasAdminPrice) {
                const { priceMin, priceMax } = product as DTO.AdminProductListItemDto;
                priceLabel = getPriceLabel(priceMin, priceMax);
              } else if (hasStorefrontPrice) {
                const { price } = product as DTO.ProductListItemDto;
                priceLabel = price != null ? `${formatPrice(price)} ₽` : "—";
              }

              const isExpanded = expandedProductIds.includes(id);

              const previewImage = "previewImage" in product ? product.previewImage : null;
              const isAvailable =
                "isAvailableOverall" in product ? product.isAvailableOverall : true;
              const imageUrl = previewImage || PLACEHOLDER_PRODUCT_IMAGE;

              return (
                <React.Fragment key={id}>
                  <TableRow className="group border-b border-border/30 transition-all hover:bg-linear-to-r hover:from-teal-50/50 hover:to-emerald-50/50 hover:shadow-sm">
                    <TableCell className="h-14 align-middle pl-4 pr-4">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border border-border/40 shrink-0">
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      #{id}
                    </TableCell>

                    <TableCell className="h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-teal-700 transition-colors">
                          {name}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors font-mono">
                          {sku ?? "—"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      {categoryName}
                    </TableCell>

                    <TableCell className="text-right text-xs sm:text-sm font-semibold text-emerald-700 group-hover:text-emerald-800 transition-colors h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      {priceLabel}
                    </TableCell>

                    <TableCell className="text-center h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      <div className="flex items-center justify-center">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">В наличии</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-medium">
                            <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">Нет в наличии</span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right h-14 align-middle pl-2 pr-2 sm:pl-4 sm:pr-4">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {sku && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 transition-all hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(sku, TOAST.SUCCESS.SKU_COPIED);
                            }}
                            aria-label={`Скопировать SKU ${sku}`}
                            title={`Скопировать SKU: ${sku}`}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 transition-all hover:bg-teal-100 hover:text-teal-700 hover:shadow-sm"
                          onClick={() => onToggleExpanded(id)}
                          aria-label={isExpanded ? "Скрыть варианты" : "Показать варианты"}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 transition-all hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-sm"
                          onClick={() =>
                            window.open(`/admin/products/${slug}`, "_blank", "noopener,noreferrer")
                          }
                          aria-label={`Редактировать товар ${name}`}
                          title="Редактировать в новой вкладке"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 transition-all text-muted-foreground hover:text-red-700 hover:bg-red-50 hover:shadow-sm"
                          disabled={isDeleting}
                          onClick={() => onDelete({ slug, name, sku })}
                          aria-label={`Удалить товар ${slug}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4">
                          <ProductVariantsTable slug={slug} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
