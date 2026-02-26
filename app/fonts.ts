/**
 * Шрифты приложения через next/font для оптимизации LCP/CLS
 *
 * Преимущества next/font:
 * - Автоматический preload критических шрифтов
 * - Inline CSS в <head> (без блокирующих запросов)
 * - font-display: swap по умолчанию
 * - Автоматические fallback шрифты для минимизации CLS
 * - Кэширование на CDN
 */

import { Inter, Nunito_Sans, Oswald } from "next/font/google";

/**
 * Oswald — для hero-заголовков (above-the-fold)
 * Критический шрифт — загружается первым
 */
export const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
  variable: "--font-oswald",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

/**
 * Nunito Sans — для body text и описаний
 * Высокий приоритет — используется в основном контенте
 */
export const nunitoSans = Nunito_Sans({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

/**
 * Inter — для UI элементов и кнопок
 * Нормальный приоритет — загружается после критических
 */
export const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
});
