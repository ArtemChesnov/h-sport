/**
 * Структурированное логирование с поддержкой контекста и фильтрации чувствительных данных
 */
/* eslint-disable no-console -- слой вывода в консоль, использование console.* осознанное */

import { env } from "@/shared/lib/config/env";

type LogLevel = "info" | "warn" | "error" | "debug" | "trace";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: Error;
  meta?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * Список полей, которые содержат чувствительные данные и не должны логироваться
 */
const SENSITIVE_FIELDS = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authSecret",
  "authorization",
  "cookie",
  "session",
  "creditCard",
  "cvv",
  "ssn",
];

/**
 * Рекурсивно удаляет чувствительные данные из объекта
 */
function sanitizeData(data: unknown, depth: number = 0): unknown {
  // Защита от слишком глубокой рекурсии
  if (depth > 10) {
    return "[Max depth reached]";
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));

      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Получает уровень логирования из переменной окружения
 */
function getLogLevel(): LogLevel {
  const envLevel = env.LOG_LEVEL?.toLowerCase();
  const validLevels: LogLevel[] = ["trace", "debug", "info", "warn", "error"];

  if (envLevel && validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  return env.NODE_ENV === "development" ? "debug" : "info";
}

/**
 * Проверяет, должен ли уровень логирования быть выведен
 */
function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  const levels: LogLevel[] = ["trace", "debug", "info", "warn", "error"];
  const currentIndex = levels.indexOf(currentLevel);
  const messageIndex = levels.indexOf(level);

  return messageIndex >= currentIndex;
}

/**
 * Выводит лог в консоль и файл (если включено)
 */
function outputLog(entry: LogEntry): void {
  // Проверяем, нужно ли логировать на этом уровне
  if (!shouldLog(entry.level)) {
    return;
  }

  // Санитизируем метаданные и контекст
  const sanitizedMeta = entry.meta
    ? (sanitizeData(entry.meta) as Record<string, unknown>)
    : undefined;
  const sanitizedContext = entry.context
    ? (sanitizeData(entry.context) as Record<string, unknown>)
    : undefined;

  // Объединяем метаданные и контекст
  const allMeta = {
    ...sanitizedMeta,
    ...sanitizedContext,
  };

  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const message = entry.message;

  // Структурированный вывод для production
  const isProduction = env.NODE_ENV === "production";
  const structuredLog = isProduction
    ? JSON.stringify({
        timestamp: entry.timestamp,
        level: entry.level,
        message,
        ...(entry.error && {
          error: {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          },
        }),
        ...(Object.keys(allMeta).length > 0 && { meta: allMeta }),
      })
    : null;

  // Вывод в консоль
  if (entry.level === "error") {
    if (structuredLog) {
      console.error(structuredLog);
    } else {
      console.error(prefix, message, entry.error || allMeta || "");
      if (entry.error instanceof Error && entry.error.stack) {
        console.error(entry.error.stack);
      }
    }
  } else if (entry.level === "warn") {
    if (structuredLog) {
      console.warn(structuredLog);
    } else {
      console.warn(prefix, message, allMeta || "");
    }
  } else if (entry.level === "debug" || entry.level === "trace") {
    if (structuredLog) {
      console.debug(structuredLog);
    } else {
      console.debug(prefix, message, allMeta || "");
    }
  } else {
    if (structuredLog) {
      console.log(structuredLog);
    } else {
      console.log(prefix, message, allMeta || "");
    }
  }

  // Запись в файл (в production всегда, в development — по переменной окружения)
  const shouldWriteToFile =
    typeof window === "undefined" &&
    (env.NODE_ENV === "production" || env.ENABLE_FILE_LOGGING === true);
  if (shouldWriteToFile) {
    // Динамический импорт вместо require для ESM совместимости
    import("./logger-enhanced")
      .then(({ loggerEnhanced }) => {
        if (entry.level === "error") {
          loggerEnhanced.error(message, entry.error, allMeta);
        } else if (entry.level === "warn") {
          loggerEnhanced.warn(message, allMeta);
        } else if (entry.level === "info") {
          loggerEnhanced.info(message, allMeta);
        } else if (entry.level === "debug" || entry.level === "trace") {
          loggerEnhanced.debug(message, allMeta);
        }
      })
      .catch(() => {
        // Игнорируем ошибки загрузки улучшенного логгера
      });
  }
}

/**
 * Создаёт запись лога
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error : undefined,
    meta: error && !(error instanceof Error) ? { error, ...meta } : meta,
    context,
  };
}

/**
 * Логгер для использования в приложении
 * Поддерживает структурированное логирование с контекстом и фильтрацией чувствительных данных
 */
export const logger = {
  /**
   * Информационное сообщение
   */
  info: (
    message: string,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): void => {
    const entry = createLogEntry("info", message, undefined, meta, context);
    outputLog(entry);
  },

  /**
   * Предупреждение
   */
  warn: (
    message: string,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): void => {
    const entry = createLogEntry("warn", message, undefined, meta, context);
    outputLog(entry);
  },

  /**
   * Ошибка
   * Автоматически извлекает контекст из AppError, если это кастомная ошибка
   */
  error: (
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): void => {
    // Если ошибка - это AppError, извлекаем её контекст
    let errorContext = context;
    if (error && typeof error === "object" && "context" in error) {
      errorContext = { ...errorContext, ...(error.context as Record<string, unknown>) };
    }

    const entry = createLogEntry("error", message, error, meta, errorContext);
    outputLog(entry);
  },

  /**
   * Отладочное сообщение
   */
  debug: (
    message: string,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): void => {
    const entry = createLogEntry("debug", message, undefined, meta, context);
    outputLog(entry);
  },

  /**
   * Трассировочное сообщение (самый детальный уровень)
   */
  trace: (
    message: string,
    meta?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): void => {
    const entry = createLogEntry("trace", message, undefined, meta, context);
    outputLog(entry);
  },
};
