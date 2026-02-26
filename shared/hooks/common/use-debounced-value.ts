/**
 * Хук для debounce значения
 */

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Используем requestAnimationFrame для оптимизации, если delay небольшой
    if (delay <= 16) {
      const frameId = requestAnimationFrame(() => {
        setDebouncedValue(value);
      });
      return () => {
        cancelAnimationFrame(frameId);
      };
    }

    // Для больших задержек используем setTimeout с оптимизацией выполнения
    const handler = setTimeout(() => {
      // Используем requestIdleCallback для неблокирующего выполнения
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(() => {
          setDebouncedValue(value);
        });
      } else {
        // Fallback: используем requestAnimationFrame
        requestAnimationFrame(() => {
          setDebouncedValue(value);
        });
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
