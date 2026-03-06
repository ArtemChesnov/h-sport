/**
 * Rate limiting middleware для API endpoints.
 * Использует in-memory store из shared/lib/rate-limit.ts.
 */

import {
  checkRateLimitAsync,
  getRateLimitKey,
  RATE_LIMIT_CONFIGS,
  type RateLimitOptions,
} from "@/shared/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
  prefix?: string;
}

const DEFAULT_MESSAGE = "Слишком много запросов. Попробуйте позже.";

/** Сообщения для пресетов (числовые лимиты — в RATE_LIMIT_CONFIGS) */
const PRESET_MESSAGES: Record<keyof typeof RATE_LIMIT_CONFIGS, string> = {
  auth: "Слишком много попыток. Подождите минуту.",
  orders: DEFAULT_MESSAGE,
  upload: "Слишком много запросов на загрузку. Попробуйте позже.",
  cart: "Слишком много операций с корзиной. Попробуйте позже.",
  webVitals: DEFAULT_MESSAGE,
  clientErrors: DEFAULT_MESSAGE,
  standard: DEFAULT_MESSAGE,
  catalog: "Слишком много запросов к каталогу. Попробуйте позже.",
  product: DEFAULT_MESSAGE,
  heavy: DEFAULT_MESSAGE,
  admin: "Превышен лимит запросов.",
  public: DEFAULT_MESSAGE,
  profile: DEFAULT_MESSAGE,
  payment: DEFAULT_MESSAGE,
  orderCancel: DEFAULT_MESSAGE,
  health: DEFAULT_MESSAGE,
};

/** Пресеты: конфиг из rate-limit.ts + сообщение для ответа */
export const RATE_LIMIT_PRESETS = Object.fromEntries(
  (Object.keys(RATE_LIMIT_CONFIGS) as Array<keyof typeof RATE_LIMIT_CONFIGS>).map((key) => [
    key,
    { ...RATE_LIMIT_CONFIGS[key], message: PRESET_MESSAGES[key] },
  ])
) as {
  [K in keyof typeof RATE_LIMIT_CONFIGS]: (typeof RATE_LIMIT_CONFIGS)[K] & { message: string };
};

/** Тело ответа при превышении rate limit (совместимо с ErrorResponse) */
export interface RateLimitErrorBody {
  success: false;
  message: string;
  code: string;
}

/**
 * Применяет rate limit проверку внутри handler и возвращает 429 response при превышении.
 * Конфиги — единый источник RATE_LIMIT_CONFIGS в shared/lib/rate-limit.ts.
 */
export async function applyRateLimit(
  request: NextRequest,
  config: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig
): Promise<NextResponse<RateLimitErrorBody> | null> {
  const resolvedConfig = typeof config === "string" ? RATE_LIMIT_PRESETS[config] : config;
  const prefix =
    typeof config === "string"
      ? config
      : ((resolvedConfig as RateLimitConfig).prefix ?? "rate-limit");
  const key = getRateLimitKey(request, prefix);
  const options: RateLimitOptions = {
    maxRequests: resolvedConfig.maxRequests,
    windowMs: resolvedConfig.windowMs,
  };

  const result = await checkRateLimitAsync(key, options);

  if (!result.allowed) {
    // Логируем срабатывание rate limit (не блокируем ответ)
    import("@/shared/lib/security-log")
      .then(({ recordSecurityEvent }) =>
        recordSecurityEvent({
          type: "RATE_LIMIT",
          request,
          details: { prefix, endpoint: request.nextUrl?.pathname ?? request.url },
        })
      )
      .catch(() => {});

    const message =
      ("message" in resolvedConfig && typeof resolvedConfig.message === "string"
        ? resolvedConfig.message
        : DEFAULT_MESSAGE) ?? DEFAULT_MESSAGE;
    return NextResponse.json<RateLimitErrorBody>(
      {
        success: false,
        message,
        code: "RATE_LIMIT_ERROR",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": resolvedConfig.maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
        },
      }
    );
  }

  return null;
}
