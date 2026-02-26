"use client";

import { TOAST } from "@/shared/constants";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { toast } from "sonner";

import { useAdminProductQuery, useDeleteProductMutation, useUpdateProductMutation, } from "@/shared/hooks";
import type { DTO } from "@/shared/services";

import { Button, Card, CardContent, CardFooter, CardHeader, Separator, Skeleton, } from "@/shared/components/ui";

import { extractBackendErrorPayload, useServerNestedFormErrors, } from "@/shared/lib";
import type { AdminProductFormValues } from "@/shared/services/dto";
import dynamic from "next/dynamic";
import { formToProductUpdateDto } from "../../lib/products";

// Динамический импорт для тяжелой формы товара - загружается только при открытии страницы
const AdminProductForm = dynamic(
  () => import("../../components/products/admin-product-form").then((mod) => ({ default: mod.AdminProductForm })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  }
);

export default function AdminProductEditPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();

  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug ?? "");

  const productQuery = useAdminProductQuery(slug);
  const updateMutation = useUpdateProductMutation(slug);
  const deleteMutation = useDeleteProductMutation();

  const { errorsTree, resetFormErrors, handleServerError } =
    useServerNestedFormErrors();

  /**
   * Снапшот ответа бэка после успешного save.
   * Нужен, чтобы сразу показать сгенерённые SKU/ID без ожидания refetch.
   */
  const [savedSnapshot, setSavedSnapshot] =
    useState<DTO.ProductDetailDto | null>(null);

  /**
   * Ключ для перемонтирования формы (чтобы локальный state формы обновился из initialValues).
   * Меняем только в onSuccess (НЕ в эффектах).
   */
  const [formKey, setFormKey] = useState(0);

  // Сбрасывать savedSnapshot в useEffect не нужно — просто не используем, если slug поменялся.
  const snapshotForThisSlug =
    savedSnapshot?.slug === slug ? savedSnapshot : null;

  // Ошибки формы сбросим при смене slug (это ок — тут нет setState напрямую).
  useEffect(() => {
    resetFormErrors();
  }, [slug, resetFormErrors]);

  const data = snapshotForThisSlug ?? productQuery.data ?? null;

  const initialValues = useMemo<AdminProductFormValues | null>(() => {
    if (!data) return null;

    return {
      name: data.name,
      slug: data.slug,
      sku: data.sku || "",
      categoryId: data.categoryId,
      description: data.description ?? "",
      composition: data.composition ?? "",
      tags: data.tags ?? [],
      images: data.images ?? [],
      variants: data.items.map((item) => ({
        id: String(item.id),
        color: item.color,
        size: item.size,
        sku: item.sku || "",
        priceRub: (item.price / 100).toString(),
        isAvailable: item.isAvailable,
        imageUrls: item.imageUrls ?? [],
      })),
    };
  }, [data]);

  const errorToastShownRef = useRef(false);

  useEffect(() => {
    if (!productQuery.isError) {
      errorToastShownRef.current = false;
      return;
    }

    if (errorToastShownRef.current) return;
    errorToastShownRef.current = true;

    const msg =
      productQuery.error instanceof Error
        ? productQuery.error.message
        : "Попробуй обновить страницу чуть позже.";

    toast.error(TOAST.ERROR.FAILED_TO_LOAD_PRODUCT, { description: msg });
  }, [productQuery.isError, productQuery.error]);

  const handleSubmit = useCallback(
    (values: AdminProductFormValues) => {
      if (!data) return;

      const payload = formToProductUpdateDto(values);

      updateMutation.mutate(payload, {
        onSuccess: (updated) => {
          resetFormErrors();

          // фиксируем снапшот с SKU/ID
          setSavedSnapshot(updated);

          // перемонтируем форму, чтобы она взяла updated в initialValues (без useEffect)
          setFormKey((k) => k + 1);

          toast.success(TOAST.SUCCESS.PRODUCT_SAVED, {
            description: "Изменения успешно применены.",
          });
          router.refresh();
        },
        onError: (err) => {
          handleServerError(err);

          const { errors, message } = extractBackendErrorPayload(err);

          if (errors && errors.length > 0) {
            toast.error(TOAST.ERROR.CHECK_FORM);
            return;
          }

          toast.error(TOAST.ERROR.FAILED_TO_SAVE_PRODUCT, {
            description:
              message ||
              (err instanceof Error
                ? err.message
                : "Попробуй ещё раз чуть позже."),
          });
        },
      });
    },
    [data, updateMutation, resetFormErrors, router, handleServerError],
  );

  const handleDelete = useCallback(() => {
    if (!data) return;

    const confirmed = window.confirm(
      `Удалить товар «${data.name}» и все его варианты? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    deleteMutation.mutate(data.slug, {
      onSuccess: () => {
        toast.success(TOAST.SUCCESS.PRODUCT_DELETED, {
          description: "Товар и его варианты удалены из каталога.",
        });
        router.push("/admin/products");
      },
      onError: (err) => {
        toast.error(TOAST.ERROR.FAILED_TO_DELETE_PRODUCT, {
          description:
            err instanceof Error ? err.message : "Попробуй ещё раз чуть позже.",
        });
      },
    });
  }, [data, deleteMutation, router]);

  if (!data && productQuery.isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        {/* Заголовок */}
        <header>
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </header>

        <Separator />

        {/* Форма товара */}
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-teal-50/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-48" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Основные поля */}
            <div className="rounded-lg border border-teal-100/50 bg-gradient-to-br from-teal-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
            <Separator />
            {/* Описание */}
            <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-40" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
            <Separator />
            {/* Варианты */}
            <div className="rounded-lg border border-purple-100/50 bg-gradient-to-br from-purple-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t border-border/50">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!data && productQuery.isError) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            Не удалось загрузить товар. Попробуй обновить страницу или вернуться к
            списку.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Товар не найден или был удалён.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <header>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Редактирование товара
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Изменение информации о товаре
          </p>
        </div>
      </header>

      <AdminProductForm
        key={`${slug}:${formKey}`}
        mode="edit"
        initialValues={initialValues}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
        errorsTree={errorsTree}
      />
    </div>
  );
}
