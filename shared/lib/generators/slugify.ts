/**
 * Транслитерация и нормализация строки в slug (только латиница, цифры и дефис)
 * Используется для создания URL-friendly идентификаторов
 *
 * @example
 * slugify("Футбольный мяч") => "futbolnyj-mjach"
 * slugify("Товар 123") => "tovar-123"
 */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return input
    .trim()
    .toLowerCase()
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      if (map[lower]) return map[lower];
      if (/[a-z0-9]/.test(lower)) return lower;
      if (/\s|-/.test(lower)) return "-";
      return "";
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
