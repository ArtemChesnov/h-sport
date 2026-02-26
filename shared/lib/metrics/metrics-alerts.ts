/**
 * Система алертов для метрик
 * Проверяет критические показатели и отправляет уведомления
 */

import { createSafeInterval } from "../safe-interval";

export interface MetricAlert {
  type: "conversion" | "error_rate" | "response_time" | "abandoned_carts";
  severity: "warning" | "critical";
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

/** Пороговые значения для алертов */
export const ALERT_THRESHOLDS = {
  /** Минимальная конверсия просмотр→корзина (warning если ниже) */
  MIN_VIEW_TO_CART_RATE: 5,
  /** Критическая конверсия просмотр→корзина */
  CRITICAL_VIEW_TO_CART_RATE: 2,
  /** Максимальный error rate API (warning) */
  MAX_ERROR_RATE: 5,
  /** Критический error rate API */
  CRITICAL_ERROR_RATE: 10,
  /** Максимальное среднее время ответа API в ms (warning) */
  MAX_AVG_RESPONSE_TIME: 500,
  /** Критическое время ответа */
  CRITICAL_AVG_RESPONSE_TIME: 1000,
  /** Максимальный процент брошенных корзин (warning) */
  MAX_ABANDONMENT_RATE: 70,
  /** Критический процент брошенных корзин */
  CRITICAL_ABANDONMENT_RATE: 85,
};

/** Хранилище активных алертов */
const activeAlerts: MetricAlert[] = [];

/** Время последней проверки алертов по типу */
const lastAlertTime: Record<string, number> = {};

/** Минимальный интервал между одинаковыми алертами (5 минут) */
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Проверяет, можно ли отправить алерт (не слишком часто)
 */
function canSendAlert(type: string): boolean {
  const now = Date.now();
  const lastTime = lastAlertTime[type] ?? 0;
  if (now - lastTime < ALERT_COOLDOWN_MS) {
    return false;
  }
  lastAlertTime[type] = now;
  return true;
}

/**
 * Добавляет алерт в хранилище
 */
function addAlert(alert: MetricAlert): void {
  activeAlerts.push(alert);
  // Храним только последние 100 алертов
  if (activeAlerts.length > 100) {
    activeAlerts.shift();
  }
}

/**
 * Проверяет конверсию и создает алерт при необходимости
 */
export function checkConversionRate(viewToCartRate: number): MetricAlert | null {
  if (viewToCartRate < ALERT_THRESHOLDS.CRITICAL_VIEW_TO_CART_RATE) {
    if (canSendAlert("conversion_critical")) {
      const alert: MetricAlert = {
        type: "conversion",
        severity: "critical",
        message: `Критически низкая конверсия просмотр→корзина: ${viewToCartRate}%`,
        value: viewToCartRate,
        threshold: ALERT_THRESHOLDS.CRITICAL_VIEW_TO_CART_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  } else if (viewToCartRate < ALERT_THRESHOLDS.MIN_VIEW_TO_CART_RATE) {
    if (canSendAlert("conversion_warning")) {
      const alert: MetricAlert = {
        type: "conversion",
        severity: "warning",
        message: `Низкая конверсия просмотр→корзина: ${viewToCartRate}%`,
        value: viewToCartRate,
        threshold: ALERT_THRESHOLDS.MIN_VIEW_TO_CART_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  }
  return null;
}

/**
 * Проверяет error rate API и создает алерт при необходимости
 */
export function checkErrorRate(errorRate: number): MetricAlert | null {
  if (errorRate > ALERT_THRESHOLDS.CRITICAL_ERROR_RATE) {
    if (canSendAlert("error_rate_critical")) {
      const alert: MetricAlert = {
        type: "error_rate",
        severity: "critical",
        message: `Критически высокий error rate API: ${errorRate}%`,
        value: errorRate,
        threshold: ALERT_THRESHOLDS.CRITICAL_ERROR_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  } else if (errorRate > ALERT_THRESHOLDS.MAX_ERROR_RATE) {
    if (canSendAlert("error_rate_warning")) {
      const alert: MetricAlert = {
        type: "error_rate",
        severity: "warning",
        message: `Высокий error rate API: ${errorRate}%`,
        value: errorRate,
        threshold: ALERT_THRESHOLDS.MAX_ERROR_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  }
  return null;
}

/**
 * Проверяет среднее время ответа API и создает алерт при необходимости
 */
export function checkResponseTime(avgResponseTime: number): MetricAlert | null {
  if (avgResponseTime > ALERT_THRESHOLDS.CRITICAL_AVG_RESPONSE_TIME) {
    if (canSendAlert("response_time_critical")) {
      const alert: MetricAlert = {
        type: "response_time",
        severity: "critical",
        message: `Критически высокое время ответа API: ${avgResponseTime}ms`,
        value: avgResponseTime,
        threshold: ALERT_THRESHOLDS.CRITICAL_AVG_RESPONSE_TIME,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  } else if (avgResponseTime > ALERT_THRESHOLDS.MAX_AVG_RESPONSE_TIME) {
    if (canSendAlert("response_time_warning")) {
      const alert: MetricAlert = {
        type: "response_time",
        severity: "warning",
        message: `Высокое время ответа API: ${avgResponseTime}ms`,
        value: avgResponseTime,
        threshold: ALERT_THRESHOLDS.MAX_AVG_RESPONSE_TIME,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  }
  return null;
}

/**
 * Проверяет процент брошенных корзин и создает алерт при необходимости
 */
export function checkAbandonmentRate(abandonmentRate: number): MetricAlert | null {
  if (abandonmentRate > ALERT_THRESHOLDS.CRITICAL_ABANDONMENT_RATE) {
    if (canSendAlert("abandonment_critical")) {
      const alert: MetricAlert = {
        type: "abandoned_carts",
        severity: "critical",
        message: `Критически высокий процент брошенных корзин: ${abandonmentRate}%`,
        value: abandonmentRate,
        threshold: ALERT_THRESHOLDS.CRITICAL_ABANDONMENT_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  } else if (abandonmentRate > ALERT_THRESHOLDS.MAX_ABANDONMENT_RATE) {
    if (canSendAlert("abandonment_warning")) {
      const alert: MetricAlert = {
        type: "abandoned_carts",
        severity: "warning",
        message: `Высокий процент брошенных корзин: ${abandonmentRate}%`,
        value: abandonmentRate,
        threshold: ALERT_THRESHOLDS.MAX_ABANDONMENT_RATE,
        timestamp: new Date(),
      };
      addAlert(alert);
      return alert;
    }
  }
  return null;
}

/**
 * Получает список активных алертов
 */
export function getActiveAlerts(): MetricAlert[] {
  return [...activeAlerts];
}

/**
 * Получает последние N алертов
 */
export function getRecentAlerts(limit: number = 10): MetricAlert[] {
  return activeAlerts.slice(-limit);
}

/**
 * Очищает старые алерты (старше 24 часов)
 */
function cleanupOldAlerts(): void {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  while (activeAlerts.length > 0 && activeAlerts[0].timestamp.getTime() < cutoff) {
    activeAlerts.shift();
  }
}

/**
 * Выполняет периодическую проверку метрик
 * Вызывается автоматически каждые 5 минут
 */
async function checkMetrics(): Promise<void> {
  try {
    // Получаем API метрики
    const { getApiMetrics } = await import("./metrics");
    const apiMetrics = await getApiMetrics(60 * 60 * 1000); // За последний час

    // Проверяем error rate
    const errorRateAlert = checkErrorRate(apiMetrics.errorRate);
    if (errorRateAlert) {
      await notifyAlert(errorRateAlert);
    }

    // Проверяем время ответа
    const responseTimeAlert = checkResponseTime(apiMetrics.averageResponseTime);
    if (responseTimeAlert) {
      await notifyAlert(responseTimeAlert);
    }

    // Очищаем старые алерты
    cleanupOldAlerts();
  } catch {
    // Игнорируем ошибки проверки метрик
  }
}

/**
 * Отправляет уведомление об алерте
 */
async function notifyAlert(alert: MetricAlert): Promise<void> {
  try {
    const { logger } = await import("../logger");

    // Логируем алерт
    if (alert.severity === "critical") {
      logger.error(`[METRICS ALERT] ${alert.message}`, {
        type: alert.type,
        value: alert.value,
        threshold: alert.threshold,
      });
    } else {
      logger.warn(`[METRICS ALERT] ${alert.message}`, {
        type: alert.type,
        value: alert.value,
        threshold: alert.threshold,
      });
    }

    // В production логируем critical алерты через систему alerts
    if (process.env.NODE_ENV === "production" && alert.severity === "critical") {
      const { alertCritical } = await import("../alerts");
      alertCritical({
        message: alert.message,
        meta: {
          type: alert.type,
          value: alert.value,
          threshold: alert.threshold,
        },
      });
    }
  } catch {
    // Игнорируем ошибки уведомлений
  }
}

// Запускаем периодическую проверку метрик (каждые 5 минут)
if (typeof window === "undefined") {
  createSafeInterval(checkMetrics, 5 * 60 * 1000, "metrics-alerts:check");
}
