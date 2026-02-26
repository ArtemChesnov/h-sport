/**
 * Базовые unit тесты для кэша
 */

import { describe, it, expect, beforeEach, afterAll } from "@jest/globals";
import { get, set, del, clear, getCacheStats } from "@/shared/lib/cache";

// Останавливаем таймеры после всех тестов
const cleanupInterval: NodeJS.Timeout | null = null;

describe("Cache", () => {
  beforeEach(() => {
    clear();
  });

  afterAll(() => {
    // Очищаем интервалы, чтобы тесты могли завершиться
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    // Даем время на завершение
    return new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should set and get value", () => {
    set("test-key", "test-value", 1000);
    const value = get<string>("test-key");
    expect(value).toBe("test-value");
  });

  it("should return null for non-existent key", () => {
    const value = get<string>("non-existent");
    expect(value).toBeNull();
  });

  it("should return null for expired entry", (done) => {
    set("expired-key", "value", 100); // 100ms TTL
    setTimeout(() => {
      const value = get<string>("expired-key");
      expect(value).toBeNull();
      done();
    }, 200);
  });

  it("should delete value", () => {
    set("delete-key", "value", 1000);
    del("delete-key");
    const value = get<string>("delete-key");
    expect(value).toBeNull();
  });

  it("should clear all values", () => {
    set("key1", "value1", 1000);
    set("key2", "value2", 1000);
    clear();
    expect(get("key1")).toBeNull();
    expect(get("key2")).toBeNull();
  });

  it("should return cache stats", () => {
    set("key1", "value1", 1000);
    set("key2", "value2", 1000);
    const stats = getCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBeGreaterThan(0);
  });
});
