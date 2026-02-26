import { COLOR_PRESETS } from "./colors";

/**
 * Возвращает HEX для переданного имени цвета.
 *
 * Важно: colorName = value из COLOR_PRESETS (например, "Чёрный", "Бежевый").
 */
export function getColorHex(colorName: string): string {
  const preset = COLOR_PRESETS.find((p) => p.value === colorName);
  return preset?.hex ?? "#E5E5E5";
}
