"use client";

import { cn } from "@/shared/lib";

interface ProductColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  className?: string;
}

// Маппинг названий цветов на CSS-цвета (учтены "е"/"ё" и регистр для русского)
const COLOR_MAP: Record<string, string> = {
  "Черный": "#000000",
  "черный": "#000000",
  "Чёрный": "#000000",
  "чёрный": "#000000",
  "Белый": "#FFFFFF",
  "белый": "#FFFFFF",
  "Красный": "#DC2626",
  "красный": "#DC2626",
  "Синий": "#2563EB",
  "синий": "#2563EB",
  "Зеленый": "#16A34A",
  "зеленый": "#16A34A",
  "Серый": "#6B7280",
  "серый": "#6B7280",
  "Розовый": "#EC4899",
  "розовый": "#EC4899",
  "Бежевый": "#D4A574",
  "бежевый": "#D4A574",
  "Коричневый": "#92400E",
  "коричневый": "#92400E",
  "Фиолетовый": "#7C3AED",
  "фиолетовый": "#7C3AED",
  "Оранжевый": "#EA580C",
  "оранжевый": "#EA580C",
  "Желтый": "#EAB308",
  "желтый": "#EAB308",
  "Жёлтый": "#EAB308",
  "жёлтый": "#EAB308",
  // Fallback (EN)
  "black": "#000000",
  "white": "#FFFFFF",
  "red": "#DC2626",
  "blue": "#2563EB",
  "green": "#16A34A",
  "gray": "#6B7280",
  "pink": "#EC4899",
  "beige": "#D4A574",
  "brown": "#92400E",
  "purple": "#7C3AED",
  "orange": "#EA580C",
  "yellow": "#EAB308",
};

/** Нормализует название цвета для поиска: trim + ё→е + lowercase для латиницы */
function normalizeColorKey(name: string): string {
  const trimmed = name.trim();
  const normalizedE = trimmed.replace(/ё/g, "е").replace(/Ё/g, "Е");
  return normalizedE;
}

function getColorStyle(colorName: string): string {
  const key = colorName.trim();
  const normalized = normalizeColorKey(colorName);
  return (
    COLOR_MAP[key] ??
    COLOR_MAP[normalized] ??
    COLOR_MAP[colorName.toLowerCase()] ??
    COLOR_MAP[normalized.toLowerCase()] ??
    "#6B7280"
  );
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
          const colorStyle = getColorStyle(color);
          const isLight = colorStyle === "#FFFFFF" || colorStyle === "#EAB308";

          return (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={cn(
                "rounded-full w-10 h-10 transition-all duration-200",
                isSelected && "ring-2 ring-primary ring-offset-2",
                isLight && "border border-gray-300"
              )}
              style={{ backgroundColor: colorStyle }}
              aria-label={`Выбрать цвет ${color}`}
              title={color}
            />
          );
        })}
      </div>
    </div>
  );
}
