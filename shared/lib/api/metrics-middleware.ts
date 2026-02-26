/**
 * Middleware для сбора метрик API запросов
 */

import { NextRequest, NextResponse } from "next/server";
import { recordApiMetric } from "@/shared/lib/metrics";

/**
 * Обертка для API routes с автоматическим сбором метрик
 * Используется для оборачивания обработчиков GET, POST, PATCH, DELETE и т.д.
 */
export function withMetrics<T>(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse<T>>,
  _routeName?: string,
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const method = request.method;
    const url = new URL(request.url);
    const endpoint = url.pathname;

    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Записываем метрику асинхронно (не блокируем ответ)
      recordApiMetric(endpoint, method, duration, statusCode).catch(() => {
        // Игнорируем ошибки записи метрик
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      // Записываем метрику ошибки асинхронно
      recordApiMetric(endpoint, method, duration, 500).catch(() => {
        // Игнорируем ошибки записи метрик
      });
      throw error;
    }
  };
}

/**
 * Автоматически оборачивает все экспорты GET, POST, PATCH, DELETE в route.ts файлах
 * Использование: export const GET = withMetricsAuto(async (req) => { ... });
 */
export function withMetricsAuto<T>(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse<T>>,
) {
  return withMetrics(handler);
}
