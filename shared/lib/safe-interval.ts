/**
 * Утилита для безопасного управления setInterval с защитой от утечек памяти
 * при hot reload в Next.js и корректной очисткой при завершении процесса
 */

type IntervalHandle = ReturnType<typeof setInterval>;

const globalForSafeInterval = globalThis as typeof globalThis & {
  __safeIntervalRegistry?: Set<IntervalHandle>;
  __safeIntervalSigtermRegistered?: boolean;
};

const activeIntervals: Set<IntervalHandle> =
  globalForSafeInterval.__safeIntervalRegistry ||
  (globalForSafeInterval.__safeIntervalRegistry = new Set());

const intervalKeyByHandle = new Map<IntervalHandle, string>();

/**
 * Регистрирует обработчик SIGTERM для очистки всех интервалов при завершении процесса
 */
function ensureSigtermHandler(): void {
  if (globalForSafeInterval.__safeIntervalSigtermRegistered || typeof process === "undefined") {
    return;
  }

  globalForSafeInterval.__safeIntervalSigtermRegistered = true;

  const cleanup = () => {
    activeIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    activeIntervals.clear();
    intervalKeyByHandle.clear();
  };

  // Очистка при завершении процесса
  process.once("SIGTERM", cleanup);
  process.once("SIGINT", cleanup);
  process.once("exit", cleanup);
}

/**
 * Создает безопасный интервал с автоматической очисткой предыдущих интервалов этого типа
 *
 * @param callback - Функция, которая будет вызываться периодически
 * @param delay - Задержка в миллисекундах
 * @param intervalKey - Уникальный ключ для идентификации интервала (для очистки предыдущих)
 * @returns NodeJS.Timeout | null
 */
export function createSafeInterval(
  callback: () => void | Promise<void>,
  delay: number,
  intervalKey: string,
): IntervalHandle | null {
  // Очищаем предыдущий интервал с тем же ключом, если он существует
  clearSafeInterval(intervalKey);

  if (typeof setInterval === "undefined") {
    return null;
  }

  // Регистрируем обработчик SIGTERM при первом вызове
  ensureSigtermHandler();

  // Создаем новый интервал
  const interval = setInterval(() => {
    try {
      const result = callback();
      // Если callback возвращает Promise, обрабатываем ошибки
      if (result instanceof Promise) {
        result.catch(() => {
          // Игнорируем ошибки в асинхронных callback
        });
      }
    } catch {
      // Игнорируем синхронные ошибки
    }
  }, delay);

  // Используем unref, чтобы интервал не блокировал завершение процесса
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }

  activeIntervals.add(interval);
  intervalKeyByHandle.set(interval, intervalKey);

  return interval;
}

/**
 * Очищает интервал по ключу
 *
 * @param intervalKey - Уникальный ключ интервала для очистки
 */
export function clearSafeInterval(intervalKey: string): void {
  for (const interval of activeIntervals) {
    if (intervalKeyByHandle.get(interval) === intervalKey) {
      clearInterval(interval);
      activeIntervals.delete(interval);
      intervalKeyByHandle.delete(interval);
      break;
    }
  }
}

/**
 * Очищает все активные интервалы
 */
export function clearAllSafeIntervals(): void {
  activeIntervals.forEach((interval) => {
    clearInterval(interval);
  });
  activeIntervals.clear();
  intervalKeyByHandle.clear();
}

/**
 * Получает количество активных интервалов (для отладки)
 */
export function getActiveIntervalsCount(): number {
  return activeIntervals.size;
}
