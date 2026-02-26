
"use client";

import { TOAST } from "@/shared/constants";
import React, { useState } from "react";
import { toast } from "sonner";

import { useCategoriesQuery } from "@/shared/hooks";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from "@/shared/components/ui";

import { Separator } from "@/shared/components/ui/separator";
import { Spinner } from "@/shared/components/ui/spinner";

import { slugify } from "@/shared/lib";
import type { AdminProductFormProps, AdminProductFormValues, VariantFormRow } from "@/shared/services/dto";
import { AlignLeft, FileText, FolderTree, Hash, Package, Palette, Tag, Type } from "lucide-react";
import { FieldErrorText } from "./product-form-field-error";
import { ProductVariantsEditor } from "./product-variants-editor";

function isVariantPriceValid(priceRub: string): boolean {
  if (!priceRub) return false;
  const cleaned = priceRub.toString().replace(/\s/g, "").replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) && num > 0;
}

export function AdminProductForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
  onDelete,
  isDeleting,
  errorsTree,
}: AdminProductFormProps) {
  const [values, setValues] = useState<AdminProductFormValues>(initialValues);
  const [tagInput, setTagInput] = useState("");

  const rootErrors = (errorsTree ?? {}) as Record<string, unknown>;

  function getRootError(field: string): string | undefined {
    const v = rootErrors?.[field];
    return typeof v === "string" ? v : undefined;
  }

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategoriesQuery();
  const categories = categoriesData?.items ?? [];

  function handleBaseChange<K extends keyof AdminProductFormValues>(
    field: K,
    value: AdminProductFormValues[K],
  ) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      // Автогенерация slug только при создании и только если пользователь не менял slug вручную.
      if (field === "name" && mode === "create") {
        const name = String(value ?? "");
        if (!prev.slug || prev.slug === slugify(prev.name)) {
          next.slug = slugify(name);
        }
      }

      return next;
    });
  }

  function handleVariantChange(nextVariants: VariantFormRow[]) {
    setValues((prev) => ({ ...prev, variants: nextVariants }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!values.name.trim()) {
      toast.error(TOAST.ERROR.PRODUCT_NAME_REQUIRED);
      return;
    }

    if (!values.categoryId) {
      toast.error(TOAST.ERROR.CATEGORY_REQUIRED);
      return;
    }

    if (values.variants.length === 0) {
      toast.error("Добавь хотя бы один вариант товара");
      return;
    }

    const invalidPriceVariant = values.variants.find(
      (v) => !isVariantPriceValid(v.priceRub),
    );
    if (invalidPriceVariant) {
      toast.error(TOAST.ERROR.PRICE_REQUIRED);
      return;
    }

    onSubmit(values);
  }

  function handleAddTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    setValues((prev) =>
      prev.tags.includes(trimmed)
        ? prev
        : { ...prev, tags: [...prev.tags, trimmed] },
    );
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldErrorText message={getRootError("_global")} />

      <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-teal-50/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-base font-semibold">Основная информация</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Раздел: Основные поля */}
          <div className="rounded-lg border border-teal-100/50 bg-gradient-to-br from-teal-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-teal-600" />
              <div className="text-sm font-semibold text-foreground">Основные поля</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">Название товара</Label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(e) => handleBaseChange("name", e.target.value)}
                    placeholder="Например, «Топ оверсайз»"
                    className="pl-9 h-9"
                  />
                </div>
                <FieldErrorText message={getRootError("name")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-xs font-medium flex items-center gap-1.5">
                  <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                  Категория
                </Label>
                <Select
                  value={values.categoryId ? String(values.categoryId) : ""}
                  onValueChange={(val) =>
                    handleBaseChange("categoryId", Number(val) || 0)
                  }
                  disabled={isCategoriesLoading || isCategoriesError}
                >
                  <SelectTrigger id="categoryId" className="h-9">
                    <SelectValue
                      placeholder={
                        isCategoriesLoading
                          ? "Загрузка категорий..."
                          : "Выбери категорию"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrorText message={getRootError("categoryId")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-medium">URL-адрес (slug)</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="slug"
                    value={values.slug}
                    onChange={(e) => handleBaseChange("slug", e.target.value)}
                    placeholder="top-oversize"
                    className="pl-9 h-9 font-mono text-xs"
                  />
                </div>
                <FieldErrorText message={getRootError("slug")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-xs font-medium">Базовый артикул (SKU)</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="sku"
                    value={values.sku}
                    onChange={(e) => handleBaseChange("sku", e.target.value)}
                    placeholder="TOP-001"
                    className="pl-9 h-9 font-mono text-xs"
                  />
                </div>
                <FieldErrorText message={getRootError("sku")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Раздел: Описание и состав */}
          <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-semibold text-foreground">Описание и состав</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium">Описание товара</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={values.description}
                  onChange={(e) =>
                    handleBaseChange("description", e.target.value)
                  }
                  placeholder="Краткое описание товара, которое увидит клиент."
                  className="text-sm resize-none"
                />
                <FieldErrorText message={getRootError("description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition" className="text-xs font-medium">Состав материала</Label>
                <Textarea
                  id="composition"
                  rows={5}
                  value={values.composition}
                  onChange={(e) =>
                    handleBaseChange("composition", e.target.value)
                  }
                  placeholder="Например: 80% полиэстер, 20% эластан."
                  className="text-sm resize-none"
                />
                <FieldErrorText message={getRootError("composition")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Раздел: Теги */}
          <div className="rounded-lg border border-purple-100/50 bg-gradient-to-br from-purple-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-semibold text-foreground">Теги</div>
            </div>

            <div className="space-y-3">
              {values.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {values.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/50 bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm transition-all hover:shadow-md hover:from-purple-100 hover:to-violet-100 cursor-pointer"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                      <span className="text-[10px] text-purple-500 hover:text-purple-700">
                        ✕
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="новинка, хит, коллекция..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="pl-9 h-9"
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleAddTag} className="h-9 cursor-pointer">
                  Добавить
                </Button>
              </div>
            </div>

            <FieldErrorText message={getRootError("tags")} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-purple-50/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base font-semibold">
              Варианты товара (цвет × размеры)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ProductVariantsEditor
            variants={values.variants}
            onChange={handleVariantChange}
            productName={values.name}
            baseSku={values.sku}
            errorsTree={errorsTree}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
        {mode === "edit" && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={Boolean(isDeleting) || Boolean(isSubmitting)}
            className="h-9 min-w-[160px] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2 h-3 w-3" />
                Удаление…
              </>
            ) : (
              "Удалить товар"
            )}
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 min-w-[180px] bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-3 w-3" />
              {mode === "create" ? "Создание…" : "Сохранение…"}
            </>
          ) : mode === "create" ? (
            "Создать товар"
          ) : (
            "Сохранить изменения"
          )}
        </Button>
      </div>
    </form>
  );
}
