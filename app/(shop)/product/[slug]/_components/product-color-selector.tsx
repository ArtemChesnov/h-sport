"use client";

import { COLOR_PRESETS, getColorHex } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";

interface ProductColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  className?: string;
}

/** HEX-значения светлых цветов (для обводки кружка), как в COLOR_PRESETS */
const LIGHT_COLOR_HEX = new Set(["#FFFFFF", "#FACC15", "#FDE047", "#F5F3EA", "#FDBA9D", "#A3E635"]);

function getColorHexForDisplay(colorName: string): string {
  const trimmed = colorName.trim();
  const preset = COLOR_PRESETS.find((p) => p.value.toLowerCase() === trimmed.toLowerCase());
  return preset?.hex ?? getColorHex(trimmed);
}

/**
 * Селектор цвета товара с круглыми элементами
 */
export function ProductColorSelector({
  colors,
  selectedColor,
  onColorSelect,
  className,
}: ProductColorSelectorProps) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-[20px] leading-[120%]">Цвет</p>
      <div className="w-full h-[3px] bg-primary my-4" />
      <div className="flex gap-3.5">
        {colors.map((color) => {
          const isSelected = selectedColor === color;
          const colorHex = getColorHexForDisplay(color);
          const isLight = LIGHT_COLOR_HEX.has(colorHex);

          return (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={cn(
                "rounded-full w-10 h-10 transition-all duration-200",
                isSelected && "ring-2 ring-primary ring-offset-2",
                isLight && "border border-gray-300"
              )}
              style={{ backgroundColor: colorHex }}
              aria-label={`Выбрать цвет ${color}`}
              title={color}
            />
          );
        })}
      </div>
    </div>
  );
}
