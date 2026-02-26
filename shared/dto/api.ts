/**
 * Типы ответов и параметров API (унифицированная структура).
 */

export interface ErrorField {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorField[];
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};
