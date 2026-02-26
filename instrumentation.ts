// instrumentation.ts

import { validateConfig } from "@/shared/lib/config/validate-config";

/**
 * Next.js Instrumentation API
 *
 * Вызывается при старте приложения (до загрузки страниц).
 * Идеальное место для валидации конфигурации и инициализации сервисов.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Валидируем конфигурацию при старте приложения
  validateConfig();

  // Дополнительная инициализация может быть добавлена здесь
  // console.log отключен, так как не должен использоваться в production
}
