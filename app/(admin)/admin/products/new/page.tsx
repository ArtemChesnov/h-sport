"use client";

import { TOAST } from "@/shared/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { formToProductCreateDto } from "@/app/(admin)/admin/lib/products";
import { useCategoriesQuery, useCreateProductMutation } from "@/shared/hooks";
import { extractBackendErrorPayload, useServerNestedFormErrors } from "@/shared/lib";
import type { AdminProductFormValues } from "@/shared/services/dto";
import dynamic from "next/dynamic";

const AdminProductForm = dynamic(
  () =>
    import("@/app/(admin)/admin/components/products/admin-product-form").then((mod) => ({
      default: mod.AdminProductForm,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-32 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-64 w-full animate-pulse rounded bg-muted" />
      </div>
    ),
  }
);

const DEFAULT_VALUES: AdminProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  categoryId: 0,
  description: "",
  composition: "",
  tags: [],
  images: [],
  variants: [],
};

export default function AdminProductNewPage() {
  const router = useRouter();
  const createMutation = useCreateProductMutation();
  const { errorsTree, resetFormErrors, handleServerError } = useServerNestedFormErrors();

  const { data: categoriesData } = useCategoriesQuery();
  const defaultCategoryId = useMemo(() => {
    const categories = categoriesData?.items ?? [];
    if (categories.length === 0) return 0;
    return categories[0].id;
  }, [categoriesData?.items]);

  const initialValues = useMemo<AdminProductFormValues>(
    () => ({
      ...DEFAULT_VALUES,
      categoryId: defaultCategoryId,
    }),
    [defaultCategoryId]
  );

  const handleSubmit = useCallback(
    (values: AdminProductFormValues) => {
      const payload = formToProductCreateDto(values);
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          resetFormErrors();
          toast.success(TOAST.SUCCESS.PRODUCT_CREATED);
          router.push(`/admin/products/${created.slug}`);
        },
        onError: (error) => {
          const payload = extractBackendErrorPayload(error);
          handleServerError(payload);
        },
      });
    },
    [createMutation, resetFormErrors, handleServerError, router]
  );

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Новый товар</h1>
        <p className="mt-1 text-sm text-muted-foreground">Добавление товара в каталог</p>
      </header>

      <AdminProductForm
        mode="create"
        initialValues={initialValues}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        errorsTree={errorsTree}
      />
    </div>
  );
}
