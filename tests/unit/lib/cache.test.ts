/**
 * Базовые unit тесты для кэша
 */

import { describe, it, expect, beforeEach, afterAll } from "@jest/globals";
import {
  get,
  set,
  del,
  clear,
  getCacheStats,
  getOrSetAsync,
  delByPrefix,
} from "@/shared/lib/cache";

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

  it("should return cache stats including inFlightCount and loaderTimeouts", () => {
    set("key1", "value1", 1000);
    set("key2", "value2", 1000);
    const stats = getCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.entries).toBe(2);
    expect(stats.maxSize).toBeGreaterThan(0);
    expect(typeof stats.hits).toBe("number");
    expect(typeof stats.misses).toBe("number");
    expect(typeof stats.evictions).toBe("number");
    expect(typeof stats.inFlightCount).toBe("number");
    expect(typeof stats.loaderTimeouts).toBe("number");
  });

  it("should getOrSetAsync (single-flight) and return fromCache", async () => {
    const { value, fromCache } = await getOrSetAsync("async-key", async () => "loaded", 5000);
    expect(value).toBe("loaded");
    expect(fromCache).toBe(false);

    const second = await getOrSetAsync("async-key", async () => "never", 5000);
    expect(second.value).toBe("loaded");
    expect(second.fromCache).toBe(true);
  });

  it("should delByPrefix", () => {
    set("pref:a", 1, 1000);
    set("pref:b", 2, 1000);
    set("other", 3, 1000);
    const n = delByPrefix("pref:");
    expect(n).toBe(2);
    expect(get("pref:a")).toBeNull();
    expect(get("pref:b")).toBeNull();
    expect(get("other")).toBe(3);
  });

  it("should not cache loader rejection and clear inFlight", async () => {
    let attempts = 0;
    const loader = async () => {
      attempts += 1;
      throw new Error("load failed");
    };
    await expect(getOrSetAsync("fail-key", loader, 5000)).rejects.toThrow("load failed");
    await expect(getOrSetAsync("fail-key", loader, 5000)).rejects.toThrow("load failed");
    expect(attempts).toBe(2);
    expect(get("fail-key")).toBeNull();
  });

  it("should optionally cache null (cacheNull)", async () => {
    const key = "null-key";
    const { value: v1, fromCache: c1 } = await getOrSetAsync(key, async () => null, 5000, {
      cacheNull: true,
      nullTtlMs: 5000,
    });
    expect(v1).toBeNull();
    expect(c1).toBe(false);

    const { value: v2, fromCache: c2 } = await getOrSetAsync(key, async () => "never", 5000, {
      cacheNull: true,
    });
    expect(v2).toBeNull();
    expect(c2).toBe(true);
  });
});
