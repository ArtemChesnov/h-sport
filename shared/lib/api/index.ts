/**
 * Экспорты API утилит
 *
 * Middleware и обработчики для API routes.
 */

export { validateRequestSize, withErrorHandling } from "./error-handler";
export {
    createErrorResponse, createValidationErrorResponse
} from "./error-response";
export { withMetrics, withMetricsAuto } from "./metrics-middleware";
export { parseFieldErrors, type ParsedFieldErrors } from "./parse-field-errors";
export {
    RATE_LIMIT_PRESETS, applyRateLimit, type RateLimitConfig,
    type RateLimitErrorBody
} from "./rate-limit-middleware";

