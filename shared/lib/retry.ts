/**
 * Retry логика с exponential backoff для критичных операций
 */

import { logger } from "./logger";

export interface RetryOptions {
  /** Максимальное количество попыток (включая первую) */
  maxRetries?: number;
  /** Начальная задержка в миллисекундах */
  initialDelay?: number;
  /** Максимальная задержка в миллисекундах */
  maxDelay?: number;
  /** Множитель для exponential backoff */
  backoffMultiplier?: number;
  /** Функция для проверки, стоит ли повторять попытку для данной ошибки */
  shouldRetry?: (error: unknown) => boolean;
  /** Функция для логирования попыток */
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "shouldRetry" | "onRetry">> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 секунда
  maxDelay: 10000, // 10 секунд
  backoffMultiplier: 2,
};

/**
 * Вычисляет задержку для попытки с exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, "shouldRetry" | "onRetry">>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Проверяет, стоит ли повторять попытку для данной ошибки
 */
function defaultShouldRetry(error: unknown): boolean {
  // Повторяем для ошибок подключения к БД
  if (error && typeof error === "object" && "code" in error) {
    const code = String(error.code);
    // Prisma ошибки подключения (P1000-P1999)
    if (code.startsWith("P10")) {
      return true;
    }
    // Network errors
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ENOTFOUND") {
      return true;
    }
  }

  // Проверяем сообщение об ошибке для Prisma ошибок закрытия соединения
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    // Ошибка закрытия соединения сервером
    if (message.includes("Server has closed the connection") ||
        message.includes("connection closed") ||
        message.includes("connection reset")) {
      return true;
    }
  }

  // Повторяем для ошибок с кодом 503 (Service Unavailable)
  if (error && typeof error === "object" && "status" in error) {
    const status = Number(error.status);
    if (status === 503 || status === 502 || status === 504) {
      return true;
    }
  }

  return false;
}

/**
 * Задержка выполнения на указанное количество миллисекунд
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Выполняет функцию с retry логикой и exponential backoff
 *
 * @param fn - Функция для выполнения
 * @param options - Опции retry
 * @returns Результат выполнения функции
 * @throws Последняя ошибка, если все попытки исчерпаны
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('/api/orders', { method: 'POST', body: data }),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts: Required<Omit<RetryOptions, "shouldRetry" | "onRetry">> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const shouldRetry = options.shouldRetry || defaultShouldRetry;
  const onRetry = options.onRetry || ((attempt, error, delay) => {
    logger.warn(
      `Retry attempt ${attempt}/${opts.maxRetries} after ${delay}ms`,
      { error: error instanceof Error ? error.message : String(error) },
    );
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Если это последняя попытка или ошибка не должна повторяться - пробрасываем ошибку
      if (attempt >= opts.maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Вычисляем задержку
      const delay = calculateDelay(attempt, opts);

      // Логируем попытку
      onRetry(attempt, error, delay);

      // Ждем перед следующей попыткой
      await sleep(delay);
    }
  }

  // Этот код не должен выполняться, но TypeScript требует возврат
  throw lastError;
}

/**
 * Создает функцию с retry логикой для использования в API routes
 *
 * @param fn - Функция для выполнения
 * @param options - Опции retry
 * @returns Обертка функции с retry логикой
 *
 * @example
 * ```typescript
 * const createOrderWithRetry = withRetry(
 *   (data) => prisma.order.create({ data }),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export function withRetry<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {},
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return retryWithBackoff(() => fn(...args), options);
  };
}
