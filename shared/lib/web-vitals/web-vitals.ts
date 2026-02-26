/**
 * Отслеживание Web Vitals для метрик производительности
 */

/**
 * Web Vitals метрики
 */
export interface WebVitals {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

/**
 * Отправляет метрики Web Vitals на сервер
 */
async function sendToAnalytics(metric: WebVitals) {
  const metricData = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    url: window.location.href,
    timestamp: Date.now(),
  };

  try {
    const response = await fetch("/api/metrics/web-vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metricData),
      keepalive: true,
    });

    // В dev режиме допустим debug логирование
    if (process.env.NODE_ENV === "development" && !response.ok) {
      console.debug("Web Vitals request failed:", response.status, response.statusText);
    }
  } catch (error) {
    // Игнорируем ошибки отправки метрик (network errors и т.п.)
    // Логируем только в development режиме
    if (process.env.NODE_ENV === "development") {
      console.debug("Failed to send web vitals:", error);
    }
  }
}

/**
 * Инициализирует отслеживание Web Vitals
 * Вызывается на клиенте
 */
export function reportWebVitals(onPerfEntry?: (metric: WebVitals) => void) {
  if (typeof window === "undefined") {
    return;
  }

  if (onPerfEntry && typeof onPerfEntry === "function") {
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
      onINP(onPerfEntry);
    });
  } else {
    // Автоматическая отправка на сервер
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    });
  }
}
