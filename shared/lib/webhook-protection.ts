/**
 * Защита от повторной обработки webhook (replay protection).
 * In-memory store для single-instance deployments.
 */

import { WEBHOOK_TTL_MS, WEBHOOK_CLEANUP_INTERVAL_MS } from "@/shared/constants";

interface ProcessedWebhook {
  processedAt: number;
}

const globalForWebhook = globalThis as typeof globalThis & {
  __webhookStore?: Map<string, ProcessedWebhook>;
  __webhookCleanupRegistered?: boolean;
};

const processedWebhooks: Map<string, ProcessedWebhook> =
  globalForWebhook.__webhookStore || (globalForWebhook.__webhookStore = new Map());

/**
 * Очистка устаревших записей
 */
function cleanup(): void {
  const now = Date.now();
  for (const [key, value] of processedWebhooks.entries()) {
    if (now - value.processedAt > WEBHOOK_TTL_MS) {
      processedWebhooks.delete(key);
    }
  }
}

// Периодическая очистка устаревших записей (защита от HMR дублирования)
// Используем .unref() чтобы интервал не блокировал завершение процесса
if (typeof setInterval !== "undefined" && !globalForWebhook.__webhookCleanupRegistered) {
  globalForWebhook.__webhookCleanupRegistered = true;
  const cleanupInterval = setInterval(cleanup, WEBHOOK_CLEANUP_INTERVAL_MS);
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

/**
 * Генерирует уникальный ключ для webhook
 *
 * @param provider - Провайдер платежей (robokassa, stripe, etc.)
 * @param transactionId - ID транзакции
 * @param signature - Подпись запроса (опционально, для дополнительной защиты)
 */
export function generateWebhookKey(
  provider: string,
  transactionId: string,
  signature?: string
): string {
  const parts = [provider, transactionId];
  if (signature) {
    // Берём первые 16 символов подписи для дополнительной уникальности
    parts.push(signature.slice(0, 16));
  }
  return parts.join(":");
}

/**
 * Проверяет, был ли webhook уже обработан
 *
 * @param key - Уникальный ключ webhook
 * @returns true если уже обработан, false если новый
 */
export function isWebhookProcessed(key: string): boolean {
  const record = processedWebhooks.get(key);
  if (!record) {
    return false;
  }

  // Проверяем TTL
  if (Date.now() - record.processedAt > WEBHOOK_TTL_MS) {
    processedWebhooks.delete(key);
    return false;
  }

  return true;
}

/**
 * Помечает webhook как обработанный
 *
 * @param key - Уникальный ключ webhook
 */
export function markWebhookProcessed(key: string): void {
  processedWebhooks.set(key, {
    processedAt: Date.now(),
  });
}

/**
 * Проверяет и помечает webhook атомарно
 * Возвращает true если webhook новый и был помечен как обработанный
 * Возвращает false если webhook уже был обработан
 *
 * @param key - Уникальный ключ webhook
 * @returns true если webhook можно обрабатывать, false если уже обработан
 */
export function tryProcessWebhook(key: string): boolean {
  if (isWebhookProcessed(key)) {
    return false;
  }

  markWebhookProcessed(key);
  return true;
}
