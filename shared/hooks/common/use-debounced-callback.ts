/**
 * Хук для debounce callback функции
 * Полезен когда нужно отложить выполнение функции, а не значения
 */

import { useCallback, useRef, useEffect } from "react";

/**
 * Создаёт debounced версию callback функции
 *
 * @param callback - Функция для debounce
 * @param delay - Задержка в миллисекундах (по умолчанию 300ms)
 * @returns Debounced callback
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value) => {
 *   saveToServer(value);
 * }, 500);
 *
 * // Вызовы будут объединены - сохранится только последнее значение
 * debouncedSave(1);
 * debouncedSave(2);
 * debouncedSave(3); // Только это значение будет сохранено через 500ms
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}
