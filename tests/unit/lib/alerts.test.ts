/**
 * Unit тесты для системы алертов
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { alert5xx, alertCritical, getAlertStats, resetAlertStats } from "@/shared/lib/alerts";

describe("Alerts", () => {
  beforeEach(() => {
    resetAlertStats();
  });

  describe("alert5xx", () => {
    it("should record 5xx alert and update stats", () => {
      alert5xx({
        statusCode: 500,
        endpoint: "/api/test",
        method: "POST",
        message: "Test error",
      });

      const stats = getAlertStats();
      expect(stats.total).toBe(1);
      expect(stats.by5xx[500]).toBe(1);
    });

    it("should track multiple alerts", () => {
      alert5xx({
        statusCode: 500,
        endpoint: "/api/test1",
        method: "POST",
        message: "Error 1",
      });

      alert5xx({
        statusCode: 502,
        endpoint: "/api/test2",
        method: "GET",
        message: "Error 2",
      });

      alert5xx({
        statusCode: 500,
        endpoint: "/api/test1",
        method: "POST",
        message: "Error 3",
      });

      const stats = getAlertStats();
      expect(stats.total).toBe(3);
      expect(stats.by5xx[500]).toBe(2);
      expect(stats.by5xx[502]).toBe(1);
    });

    it("should track top endpoints", () => {
      for (let i = 0; i < 5; i++) {
        alert5xx({
          statusCode: 500,
          endpoint: "/api/frequent",
          method: "POST",
          message: "Frequent error",
        });
      }

      for (let i = 0; i < 2; i++) {
        alert5xx({
          statusCode: 500,
          endpoint: "/api/rare",
          method: "POST",
          message: "Rare error",
        });
      }

      const stats = getAlertStats();
      expect(stats.topEndpoints[0].endpoint).toBe("/api/frequent");
      expect(stats.topEndpoints[0].count).toBe(5);
      expect(stats.topEndpoints[1].endpoint).toBe("/api/rare");
      expect(stats.topEndpoints[1].count).toBe(2);
    });

    it("should handle error objects", () => {
      const error = new Error("Test error message");

      alert5xx({
        statusCode: 500,
        endpoint: "/api/test",
        method: "POST",
        message: "Error occurred",
        error,
      });

      const stats = getAlertStats();
      expect(stats.total).toBe(1);
    });
  });

  describe("alertCritical", () => {
    it("should record critical alert", () => {
      alertCritical({
        message: "Critical system failure",
      });

      const stats = getAlertStats();
      expect(stats.total).toBe(1);
    });

    it("should handle error with meta", () => {
      const error = new Error("Database connection lost");

      alertCritical({
        message: "Critical error",
        error,
        meta: { database: "primary", retries: 3 },
      });

      const stats = getAlertStats();
      expect(stats.total).toBe(1);
    });
  });

  describe("resetAlertStats", () => {
    it("should clear all stats", () => {
      alert5xx({
        statusCode: 500,
        endpoint: "/api/test",
        method: "POST",
        message: "Error",
      });

      let stats = getAlertStats();
      expect(stats.total).toBe(1);

      resetAlertStats();

      stats = getAlertStats();
      expect(stats.total).toBe(0);
      expect(stats.topEndpoints).toHaveLength(0);
    });
  });
});
