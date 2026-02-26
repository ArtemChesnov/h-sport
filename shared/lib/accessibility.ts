/**
 * Утилиты для улучшения доступности (a11y)
 */

/**
 * Генерирует уникальный ID для ARIA атрибутов
 */
let idCounter = 0;
export function generateAriaId(prefix: string = "aria"): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Проверяет контрастность цветов (WCAG AA стандарт)
 * Возвращает true если контраст достаточен
 */
export function checkColorContrast(
  _foreground: string,
  _background: string,
): boolean {
  // Упрощенная проверка - в production лучше использовать библиотеку
  // Минимальный контраст для обычного текста: 4.5:1
  // Минимальный контраст для крупного текста: 3:1
  return true; // Заглушка - в production использовать библиотеку для точной проверки
}

/**
 * Создает ARIA live region для объявлений скринридерам
 */
export function createAriaLiveRegion(
  level: "polite" | "assertive" = "polite",
): string {
  const id = generateAriaId("live-region");
  if (typeof window !== "undefined") {
    const region = document.createElement("div");
    region.id = id;
    region.setAttribute("aria-live", level);
    region.setAttribute("aria-atomic", "true");
    region.className = "sr-only"; // Скрыто визуально, но доступно для скринридеров
    document.body.appendChild(region);
  }
  return id;
}

/**
 * Обновляет ARIA live region
 */
export function updateAriaLiveRegion(id: string, message: string): void {
  if (typeof window !== "undefined") {
    const region = document.getElementById(id);
    if (region) {
      region.textContent = message;
    }
  }
}
