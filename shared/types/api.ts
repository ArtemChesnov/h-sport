/**
 * Типы ответов и параметров API (унифицированная структура).
 */

/**
 * Поле ошибки для валидации
 */
export interface ErrorField {
  field?: string;
  message: string;
}

/**
 * Стандартный формат ответа с ошибкой для всех API endpoints
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorField[];
  code?: string;
}

/**
 * Успешный ответ API с данными (общий формат).
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

/**
 * Параметры роутов Next.js App Router (Next.js 15).
 * params является Promise, поэтому нужно использовать await.
 */
export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};
