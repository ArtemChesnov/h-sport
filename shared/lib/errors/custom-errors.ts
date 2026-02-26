/**
 * Кастомные классы ошибок для типобезопасной обработки ошибок
 */

/**
 * Базовый класс для всех кастомных ошибок приложения
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;

    // Сохраняем стек трейс
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации данных
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors?: Array<{ field: string; message: string }>,
    context?: Record<string, unknown>,
  ) {
    super(message, 400, "VALIDATION_ERROR", true, context);
  }
}

/**
 * Ошибка rate limiting
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = "Слишком много запросов. Попробуйте позже.",
    public readonly resetAt?: number,
    context?: Record<string, unknown>,
  ) {
    super(message, 429, "RATE_LIMIT_ERROR", true, context);
  }
}

/**
 * Ошибка базы данных
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    public readonly prismaCode?: string,
    context?: Record<string, unknown>,
  ) {
    // Ошибки подключения к БД (P1001, P1002, P1003) - операционные (503 Service Unavailable)
    // Остальные ошибки БД - системные (500)
    const isConnectionError = prismaCode?.startsWith("P100");
    super(
      message,
      isConnectionError ? 503 : 500,
      isConnectionError ? "DATABASE_CONNECTION_ERROR" : "DATABASE_ERROR",
      isConnectionError, // Ошибки подключения - операционные
      context,
    );
  }
}

/**
 * Ошибка внешнего сервиса
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly originalError?: unknown,
    context?: Record<string, unknown>,
  ) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", true, context);
  }
}

/**
 * Проверяет, является ли ошибка экземпляром AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Преобразует Prisma ошибку в DatabaseError
 */
function handlePrismaError(error: unknown): DatabaseError | null {
  // Проверяем, является ли это Prisma ошибкой
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "meta" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("P")
  ) {
    const prismaError = error as {
      code: string;
      meta?: Record<string, unknown>;
      message?: string;
    };

    let message = "Ошибка базы данных";
    const context: Record<string, unknown> = {
      prismaCode: prismaError.code,
      ...prismaError.meta,
    };

    // Специфичные сообщения для разных типов ошибок
    switch (prismaError.code) {
      case "P1001":
        message = "Не удалось подключиться к базе данных. Сервер недоступен.";
        break;
      case "P1002":
        message = "Таймаут подключения к базе данных.";
        break;
      case "P1003":
        message = "База данных не найдена.";
        break;
      case "P1008":
        message = "Операция была прервана.";
        break;
      case "P2002":
        message = "Нарушение уникальности данных.";
        break;
      case "P2025":
        message = "Запись не найдена.";
        break;
      default:
        message = prismaError.message || `Ошибка базы данных (${prismaError.code})`;
    }

    return new DatabaseError(message, error, prismaError.code, context);
  }

  return null;
}

/**
 * Преобразует любую ошибку в AppError для безопасной обработки
 */
export function toAppError(error: unknown, defaultMessage: string = "Внутренняя ошибка сервера"): AppError {
  if (isAppError(error)) {
    return error;
  }

  // Обрабатываем Prisma ошибки
  const prismaError = handlePrismaError(error);
  if (prismaError) {
    return prismaError;
  }

  if (error instanceof Error) {
    return new AppError(error.message || defaultMessage, 500, "UNKNOWN_ERROR", false);
  }

  return new AppError(defaultMessage, 500, "UNKNOWN_ERROR", false);
}
