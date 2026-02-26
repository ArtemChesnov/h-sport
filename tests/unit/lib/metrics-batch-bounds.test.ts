/**
 * Unit тесты для проверки bounds/FIFO в metrics-batch
 *
 * Тестируем:
 * 1. Buffer bounds: буфер никогда не превышает MAX_BUFFER_SIZE
 * 2. FIFO eviction: при переполнении вытесняются САМЫЕ СТАРЫЕ записи
 * 3. Ошибка flush + возврат: возврат не раздувает буфер сверх лимита
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  applyBoundsOnAdd,
  applyBoundsOnReturn,
  getBufferSizes,
  __resetBuffersForTesting,
  addApiMetricToBuffer,
  addWebVitalsMetricToBuffer,
  MAX_BUFFER_SIZE,
} from "@/shared/lib/metrics";

describe("metrics-batch bounds", () => {
  // =====================================================
  // Тесты чистых функций applyBoundsOnAdd/applyBoundsOnReturn
  // =====================================================

  describe("applyBoundsOnAdd (pure function)", () => {
    it("should add item to empty buffer without eviction", () => {
      const buffer: number[] = [];
      const evicted = applyBoundsOnAdd(buffer, 1, 10);

      expect(buffer).toEqual([1]);
      expect(evicted).toBe(0);
    });

    it("should add item to non-full buffer without eviction", () => {
      const buffer = [1, 2, 3];
      const evicted = applyBoundsOnAdd(buffer, 4, 10);

      expect(buffer).toEqual([1, 2, 3, 4]);
      expect(evicted).toBe(0);
    });

    it("should evict oldest item (FIFO) when buffer is full", () => {
      const buffer = [1, 2, 3, 4, 5];
      const evicted = applyBoundsOnAdd(buffer, 6, 5);

      // 1 был удалён (самый старый), 6 добавлен в конец
      expect(buffer).toEqual([2, 3, 4, 5, 6]);
      expect(evicted).toBe(1);
    });

    it("should maintain FIFO order after multiple additions to full buffer", () => {
      const buffer = [1, 2, 3];
      const maxSize = 3;

      // Добавляем 4, 5, 6 — каждый раз вытесняется самый старый
      applyBoundsOnAdd(buffer, 4, maxSize); // [2, 3, 4]
      applyBoundsOnAdd(buffer, 5, maxSize); // [3, 4, 5]
      applyBoundsOnAdd(buffer, 6, maxSize); // [4, 5, 6]

      expect(buffer).toEqual([4, 5, 6]);
      expect(buffer.length).toBe(maxSize);
    });

    it("should never exceed maxSize even with many additions", () => {
      const buffer: number[] = [];
      const maxSize = 5;

      // Добавляем 100 элементов
      for (let i = 0; i < 100; i++) {
        applyBoundsOnAdd(buffer, i, maxSize);
        // После каждого добавления буфер не должен превышать maxSize
        expect(buffer.length).toBeLessThanOrEqual(maxSize);
      }

      // В конце должны остаться последние 5 элементов (95-99)
      expect(buffer).toEqual([95, 96, 97, 98, 99]);
    });

    it("should work correctly with maxSize = 1", () => {
      const buffer: string[] = [];

      applyBoundsOnAdd(buffer, "a", 1);
      expect(buffer).toEqual(["a"]);

      applyBoundsOnAdd(buffer, "b", 1);
      expect(buffer).toEqual(["b"]);

      applyBoundsOnAdd(buffer, "c", 1);
      expect(buffer).toEqual(["c"]);
    });
  });

  describe("applyBoundsOnReturn (pure function)", () => {
    it("should return all items to empty buffer if they fit", () => {
      const buffer: number[] = [];
      const itemsToReturn = [1, 2, 3];
      const dropped = applyBoundsOnReturn(buffer, itemsToReturn, 10);

      expect(buffer).toEqual([1, 2, 3]);
      expect(dropped).toBe(0);
    });

    it("should drop excess items if they exceed maxSize", () => {
      const buffer: number[] = [];
      const itemsToReturn = [1, 2, 3, 4, 5, 6, 7];
      const dropped = applyBoundsOnReturn(buffer, itemsToReturn, 5);

      // Только первые 5 элементов добавляются
      expect(buffer).toEqual([1, 2, 3, 4, 5]);
      expect(dropped).toBe(2); // 6 и 7 отброшены
    });

    it("should NOT return items if buffer is not empty (safety)", () => {
      const buffer = [100, 200];
      const itemsToReturn = [1, 2, 3];
      const dropped = applyBoundsOnReturn(buffer, itemsToReturn, 10);

      // Буфер не пуст — ничего не возвращаем, всё отбрасываем
      expect(buffer).toEqual([100, 200]); // Не изменился
      expect(dropped).toBe(3); // Все отброшены
    });

    it("should preserve order when returning items (unshift)", () => {
      const buffer: number[] = [];
      const itemsToReturn = [10, 20, 30];
      applyBoundsOnReturn(buffer, itemsToReturn, 100);

      // Элементы должны быть в начале в правильном порядке
      expect(buffer).toEqual([10, 20, 30]);
    });
  });

  // =====================================================
  // Интеграционные тесты с реальными буферами
  // =====================================================

  describe("addApiMetricToBuffer integration", () => {
    beforeEach(() => {
      // Сбрасываем буферы перед каждым тестом
      __resetBuffersForTesting();
    });

    it("should add metrics to buffer", () => {
      addApiMetricToBuffer("/api/test", "GET", 100, 200);

      const sizes = getBufferSizes();
      expect(sizes.api).toBe(1);
    });

    it("should enforce MAX_BUFFER_SIZE limit", () => {
      // Добавляем больше метрик, чем MAX_BUFFER_SIZE
      const testSize = Math.min(MAX_BUFFER_SIZE + 100, 1100); // Ограничиваем для скорости
      for (let i = 0; i < testSize; i++) {
        addApiMetricToBuffer(`/api/test/${i}`, "GET", 100, 200);
      }

      const sizes = getBufferSizes();
      // Буфер не должен превышать MAX_BUFFER_SIZE
      expect(sizes.api).toBeLessThanOrEqual(MAX_BUFFER_SIZE);
    });
  });

  describe("addWebVitalsMetricToBuffer integration", () => {
    beforeEach(() => {
      __resetBuffersForTesting();
    });

    it("should add metrics to buffer", () => {
      addWebVitalsMetricToBuffer("LCP", 1000, 100, "metric-1", "/test");

      const sizes = getBufferSizes();
      expect(sizes.webVitals).toBe(1);
    });

    it("should enforce MAX_BUFFER_SIZE limit", () => {
      const testSize = Math.min(MAX_BUFFER_SIZE + 100, 1100);
      for (let i = 0; i < testSize; i++) {
        addWebVitalsMetricToBuffer("LCP", 1000 + i, 100, `metric-${i}`, "/test");
      }

      const sizes = getBufferSizes();
      expect(sizes.webVitals).toBeLessThanOrEqual(MAX_BUFFER_SIZE);
    });
  });

  // =====================================================
  // Тесты сценария "ошибка flush + возврат"
  // =====================================================

  describe("flush error backpressure simulation", () => {
    it("should not grow buffer infinitely on repeated flush errors", () => {
      // Симулируем сценарий:
      // 1. Буфер пуст
      // 2. Приходят метрики, накапливаются
      // 3. Flush падает, метрики возвращаются
      // 4. Приходят ещё метрики
      // 5. Flush снова падает
      // ...
      // Буфер не должен расти бесконечно

      const buffer: number[] = [];
      const maxSize = 10;

      // Симулируем несколько циклов "добавление + неудачный flush"
      for (let cycle = 0; cycle < 5; cycle++) {
        // Добавляем 5 элементов
        for (let i = 0; i < 5; i++) {
          applyBoundsOnAdd(buffer, cycle * 10 + i, maxSize);
        }

        // Симулируем flush: забираем часть элементов
        const flushed = buffer.splice(0, 3);

        // Симулируем ошибку: пытаемся вернуть
        // Если буфер не пуст — ничего не вернётся (by design)
        const dropped = applyBoundsOnReturn(buffer, flushed, maxSize);

        // Буфер никогда не должен превышать maxSize
        expect(buffer.length).toBeLessThanOrEqual(maxSize);
      }
    });

    it("should return items only when buffer is empty after flush", () => {
      const buffer = [1, 2, 3, 4, 5];
      const maxSize = 10;

      // Забираем ВСЕ элементы на flush
      const flushed = buffer.splice(0, buffer.length);
      expect(buffer.length).toBe(0);

      // Flush падает — возвращаем элементы
      const dropped = applyBoundsOnReturn(buffer, flushed, maxSize);

      expect(buffer).toEqual([1, 2, 3, 4, 5]);
      expect(dropped).toBe(0);
    });

    it("should drop items if return would exceed maxSize", () => {
      const buffer: number[] = [];
      const maxSize = 3;

      // Пытаемся вернуть 5 элементов в буфер размером 3
      const flushed = [1, 2, 3, 4, 5];
      const dropped = applyBoundsOnReturn(buffer, flushed, maxSize);

      expect(buffer).toEqual([1, 2, 3]); // Только первые 3
      expect(dropped).toBe(2); // 4 и 5 отброшены
      expect(buffer.length).toBeLessThanOrEqual(maxSize);
    });
  });
});
