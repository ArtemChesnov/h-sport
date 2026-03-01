/**
 * Неразрывный пробел перед знаком процента (по типографике).
 */
const NBSP = "\u00A0";

/**
 * Соответствие английских названий материалов русским (регистронезависимо).
 */
const MATERIAL_RU: Record<string, string> = {
  polyamide: "полиамид",
  polyester: "полиэстер",
  nylon: "нейлон",
  elastane: "эластан",
  lycra: "лайкра",
  spandex: "спандекс",
  cotton: "хлопок",
  wool: "шерсть",
  silk: "шелк",
  viscose: "вискоза",
};

const MATERIAL_KEYS = Object.keys(MATERIAL_RU).sort((a, b) => b.length - a.length);

/**
 * Форматирует текст состава/описания: названия материалов на русском,
 * неразрывный пробел перед знаком процента.
 * Не меняет уже переведённые слова (нейлон, эластан и т.д.).
 */
export function formatCompositionText(text: string | null | undefined): string {
  if (text == null || typeof text !== "string") return "";
  let s = text.trim();
  if (!s) return "";

  // Неразрывный пробел перед %: "90%" и "90 %" → "90\u00A0%"
  s = s.replace(/(\d)\s*%/g, `$1${NBSP}%`);

  // Замена названий материалов (целые слова, регистронезависимо)
  for (const en of MATERIAL_KEYS) {
    const ru = MATERIAL_RU[en];
    const re = new RegExp(`\\b${en}\\b`, "gi");
    s = s.replace(re, ru);
  }

  return s;
}
