/**
 * Компонент фильтра по размеру
 * Использует размеры из API или fallback на статический список
 */

import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DTO } from "@/shared/services";

/** Fallback список размеров если API недоступен */
const FALLBACK_SIZES: DTO.SizeDto[] = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "ONE_SIZE",
];

const SIZE_LABELS: Record<DTO.SizeDto, string> = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  ONE_SIZE: "Один размер",
};

type CatalogSizeFilterProps = {
  /** Размеры из API (если доступны) */
  availableSizes?: DTO.SizeDto[];
  selectedSizes: DTO.SizeDto[];
  onToggle: (size: DTO.SizeDto) => void;
  isLoading?: boolean;
};

export function CatalogSizeFilter({
  availableSizes,
  selectedSizes,
  onToggle,
  isLoading,
}: CatalogSizeFilterProps) {
  const [showAll, setShowAll] = React.useState(false);

  // Используем размеры из API или fallback
  const sizes = availableSizes && availableSizes.length > 0 ? availableSizes : FALLBACK_SIZES;

  const displayedSizes = React.useMemo(() => {
    return showAll ? sizes : sizes.slice(0, 5);
  }, [showAll, sizes]);

  return (
    <div>
      {isLoading ? (
        <div className="h-[27px] w-20 bg-accent animate-pulse rounded mb-3" />
      ) : (
        <h3 className="text-[18px] font-regular text-[#1f1e1e] mb-3">
          Размер
        </h3>
      )}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent animate-pulse rounded border-2 border-accent" />
              <div className="h-6 w-20 bg-accent animate-pulse rounded" />
            </label>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedSizes.map((size) => {
            const isChecked = selectedSizes.includes(size);
            return (
              <label
                key={size}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggle(size);
                    }}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150",
                      isChecked
                        ? "bg-[#EB6081] border-[#EB6081]"
                        : "bg-white border-[#EB6081] group-hover:border-[#d8859d]",
                    )}
                  >
                    {isChecked && (
                      <Check className="h-3 w-3 text-white stroke-[2.5] animate-in fade-in-0 zoom-in-75 duration-150" />
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-base font-light transition-colors duration-150",
                    isChecked
                      ? "text-[#1f1e1e] font-medium"
                      : "text-[#1f1e1e] group-hover:text-[#EB6081]",
                  )}
                >
                  {SIZE_LABELS[size]}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="h-6 w-28 bg-accent animate-pulse rounded mt-3" />
      ) : (
        sizes.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-base font-light text-[#1f1e1e] hover:text-[#EB6081] transition-colors duration-150 flex items-center gap-1 mt-3 cursor-pointer"
          >
            {showAll ? "Скрыть" : "Смотреть всё"}
            {showAll ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-150" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-150" />
            )}
          </button>
        )
      )}
    </div>
  );
}
