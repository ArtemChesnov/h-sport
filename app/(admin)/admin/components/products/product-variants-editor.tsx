"use client";

import { TOAST } from "@/shared/constants";
import { useMemo } from "react";
import { toast } from "sonner";

import type { NestedFormErrors } from "@/shared/lib/validation/map-fields-errors";
import { DTO } from "@/shared/services";

import {
  Button,
  ColorBadge,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/shared/components/ui";

import { COLOR_PRESETS } from "@/shared/constants";

import type { VariantFormRow } from "@/shared/services/dto";
import { createLocalId } from "../../lib/utils";
import { ColorImagesEditor } from "./product-color-images-editor";
import { FieldErrorText } from "./product-form-field-error";

const ALL_SIZES: DTO.SizeDto[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"];

type VariantsEditorProps = {
  variants: VariantFormRow[];
  onChange: (next: VariantFormRow[]) => void;

  productName: string;
  baseSku?: string;
  errorsTree?: NestedFormErrors;
};

export function ProductVariantsEditor({
  variants,
  onChange,
  productName,
  baseSku,
  errorsTree,
}: VariantsEditorProps) {
  const groups = useMemo(() => {
    const map = new Map<string, { color: string; items: VariantFormRow[] }>();
    for (const v of variants) {
      const existing = map.get(v.color);
      if (!existing) map.set(v.color, { color: v.color, items: [v] });
      else existing.items.push(v);
    }
    return Array.from(map.values());
  }, [variants]);

  const usedColors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);

  /**
   * Маппинг ошибок от сервера к variant.id.
   * ВАЖНО: errorsTree.items[i] соответствует variants[i] (в порядке отправки payload).
   */
  const errorsByVariantId = useMemo(() => {
    const map = new Map<string, Record<string, string>>();
    const raw = (errorsTree as unknown as { items?: Array<Record<string, string>> })?.items;

    if (!raw || raw.length === 0) return map;

    variants.forEach((v, i) => {
      const e = raw[i];
      if (e) map.set(v.id, e);
    });

    return map;
  }, [errorsTree, variants]);

  function handleAddColor() {
    const availablePreset = COLOR_PRESETS.find((preset) => !usedColors.includes(preset.value));

    if (!availablePreset) {
      toast.error(TOAST.ERROR.ALL_COLORS_ADDED);
      return;
    }

    const newVariant: VariantFormRow = {
      id: createLocalId(),
      color: availablePreset.value,
      size: "ONE_SIZE",
      sku: "",
      priceRub: "",
      isAvailable: true,
      imageUrls: [],
    };

    onChange([...variants, newVariant]);
  }

  function handleRemoveColor(color: string) {
    if (!confirm(`Удалить все варианты цвета «${color}»?`)) return;
    onChange(variants.filter((v) => v.color !== color));
  }

  function handleAddSize(color: string) {
    const colorVariants = variants.filter((v) => v.color === color);
    const usedSizes = colorVariants.map((v) => v.size);
    const availableSizes = ALL_SIZES.filter((size) => !usedSizes.includes(size));

    if (availableSizes.length === 0) {
      toast.error(TOAST.ERROR.SAME_COLOR_SIZE);
      return;
    }

    const nextSize = availableSizes[0];

    const newVariant: VariantFormRow = {
      id: createLocalId(),
      color,
      size: nextSize,
      sku: "",
      priceRub: colorVariants[0]?.priceRub || "",
      isAvailable: true,
      imageUrls: [...(colorVariants[0]?.imageUrls ?? [])],
    };

    onChange([...variants, newVariant]);
  }

  function updateVariant(id: string, patch: Partial<VariantFormRow>) {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function removeVariant(id: string) {
    onChange(variants.filter((v) => v.id !== id));
  }

  if (!variants.length && !groups.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Пока нет ни одного варианта. Добавь первый цвет, чтобы начать.
        </p>
        <Button type="button" variant="outline" size="lg" onClick={handleAddColor}>
          + Добавить цвет
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const { color, items } = group;

        const usedSizes = items.map((i) => i.size);
        const availableSizes = ALL_SIZES.filter((s) => !usedSizes.includes(s));

        const colorImages = items[0]?.imageUrls ?? [];
        const skuForColor = items[0]?.sku || baseSku || "";

        const handleColorImagesChange = (next: string[]) => {
          const nextVariants = variants.map((v) =>
            v.color === color ? { ...v, imageUrls: next } : v
          );
          onChange(nextVariants);
        };

        const colorError = items
          .map((v) => errorsByVariantId.get(v.id)?.color)
          .find((msg) => typeof msg === "string" && msg.length > 0);

        return (
          <div key={color} className="space-y-3 rounded-lg border border-border/70 bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">Цвет:</span>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <ColorBadge colorName={color} withLabel={false} />
                      <Select
                        value={color}
                        onValueChange={(nextColor) => {
                          const nextVariants = variants.map((v) =>
                            v.color === color ? { ...v, color: nextColor } : v
                          );
                          onChange(nextVariants);
                        }}
                      >
                        <SelectTrigger className="h-8 w-48">
                          <SelectValue placeholder="Выбери цвет" />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_PRESETS.map((preset) => (
                            <SelectItem key={preset.value} value={preset.value}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <FieldErrorText message={colorError} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => handleAddSize(color)}
                  disabled={availableSizes.length === 0}
                >
                  + Размер
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={() => handleRemoveColor(color)}
                >
                  Удалить цвет
                </Button>
              </div>
            </div>

            <ColorImagesEditor
              color={color}
              imageUrls={colorImages}
              onChange={handleColorImagesChange}
              productName={productName}
              sku={skuForColor}
            />

            <div className="mt-6 space-y-2">
              {items.map((variant) => {
                const variantErrors = errorsByVariantId.get(variant.id);

                return (
                  <div
                    key={variant.id}
                    className="grid items-end gap-3 md:grid-cols-[minmax(0,140px)_minmax(0,220px)_minmax(0,160px)_auto_auto]"
                  >
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Размер</Label>
                      <Select
                        value={variant.size}
                        onValueChange={(val) =>
                          updateVariant(variant.id, {
                            size: val as DTO.SizeDto,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_SIZES.map((size) => (
                            <SelectItem key={size} value={size} className="cursor-pointer">
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldErrorText message={variantErrors?.size} />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">
                        SKU (генерируется автоматически)
                      </Label>
                      <Input
                        className="h-8 w-full text-xs"
                        value={variant.sku}
                        readOnly
                        disabled
                        placeholder="Сгенерируется автоматически после сохранения"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Цена, ₽</Label>
                      <Input
                        className="h-8 w-full"
                        type="number"
                        inputMode="decimal"
                        value={variant.priceRub}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            priceRub: e.target.value,
                          })
                        }
                        placeholder="1990"
                      />
                      <FieldErrorText message={variantErrors?.price} />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">В наличии</Label>
                      <div className="flex h-8 items-center">
                        <Switch
                          checked={variant.isAvailable}
                          onCheckedChange={(checked) =>
                            updateVariant(variant.id, { isAvailable: checked })
                          }
                        />
                      </div>
                      <FieldErrorText message={variantErrors?.isAvailable} />
                    </div>

                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={() => removeVariant(variant.id)}
                      >
                        Удалить размер
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="lg" onClick={handleAddColor}>
        + Добавить цвет
      </Button>
    </div>
  );
}
