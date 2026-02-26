/**
 * Компонент фильтра по цвету
 */

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { COLOR_PRESETS, getColorHex } from "@/shared/constants";

type CatalogColorFilterProps = {
  colors: string[];
  selectedColors: string[];
  onToggle: (color: string) => void;
  isLoading?: boolean;
};

export function CatalogColorFilter({
  colors,
  selectedColors,
  onToggle,
  isLoading,
}: CatalogColorFilterProps) {
  const [showAll, setShowAll] = React.useState(false);

  const displayedColors = React.useMemo(() => {
    if (colors.length === 0) return [];
    return showAll ? colors : colors.slice(0, 5);
  }, [colors, showAll]);

  // Получаем цвет из COLOR_PRESETS
  const getColorInfo = (colorName: string) => {
    const preset = COLOR_PRESETS.find((p) => p.value.toLowerCase() === colorName.toLowerCase());
    return preset || { label: colorName, hex: getColorHex(colorName) };
  };

  return (
    <div className="">
      {isLoading ? (
        <div className="h-6.75 w-16 bg-accent animate-pulse rounded mb-3" />
      ) : (
        <h3 className="text-[18px] font-regular text-[#1f1e1e] mb-3">Цвет</h3>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <label key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent animate-pulse rounded-full" />
              <div className="h-5 w-28 bg-accent animate-pulse rounded" />
            </label>
          ))}
        </div>
      ) : (
        <div className="max-[768px]:pl-1.25 flex flex-col gap-2">
          {displayedColors.map((color) => {
            const colorInfo = getColorInfo(color);
            const isChecked = selectedColors.some(
              (c) => c.toLowerCase().trim() === color.toLowerCase().trim()
            );
            return (
              <button
                key={color}
                type="button"
                onClick={() => onToggle(color)}
                className="flex items-center gap-2 cursor-pointer group text-left"
              >
                <div
                  className={cn(
                    " w-6 h-6 rounded-full transition-all duration-150",
                    isChecked ? "border-2 border-[#EB6081] ring-2 ring-[#EB6081] ring-offset-1" : ""
                  )}
                  style={{ backgroundColor: colorInfo.hex }}
                />
                <span
                  className={cn(
                    "text-base font-light transition-colors duration-150",
                    isChecked
                      ? "text-[#1f1e1e] font-medium"
                      : "text-[#1f1e1e] group-hover:text-[#EB6081]"
                  )}
                >
                  {colorInfo.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="h-6 w-28 bg-accent animate-pulse rounded mt-3" />
      ) : (
        colors.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-base font-light text-[#1f1e1e] hover:text-[#EB6081] transition-colors duration-150 flex items-center gap-1 mt-3 mb-0 cursor-pointer"
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
