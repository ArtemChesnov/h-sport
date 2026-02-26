/**
 * Улучшенное логирование с записью в файл (для production)
 * Бесплатная альтернатива Sentry для мониторинга ошибок
 *
 * ВАЖНО: Этот модуль работает только на сервере. fs/path импортируются лениво.
 */

// fs и path импортируются динамически только на сервере
let fs: typeof import("fs") | null = null;
let path: typeof import("path") | null = null;
let initialized = false;

function initModules(): boolean {
  if (typeof window !== "undefined") return false;
  if (initialized) return !!fs;
  initialized = true;

  try {
    // Используем динамический require чтобы webpack не пытался разрешить модули на клиенте
    const requireFn = typeof __webpack_require__ === "function"
      ? __non_webpack_require__
      : require;
    fs = requireFn("fs");
    path = requireFn("path");

    // Безопасно создаем директорию для логов
    if (path && fs) {
      const logsDir = path.join(process.cwd(), "logs");
      try {
        // Используем recursive: true для безопасного создания (не падает, если директория уже существует)
        fs.mkdirSync(logsDir, { recursive: true });
      } catch (mkdirError) {
        // Если не удалось создать директорию (нет прав, диск полон и т.п.),
        // логируем в консоль, но не падаем - логгер продолжит работать только в консоль
        console.warn("[Logger] Failed to create logs directory, file logging disabled:", mkdirError);
        // Возвращаем false, чтобы файловое логирование не использовалось
        return false;
      }
    }
    return true;
  } catch (error) {
    // При любой другой ошибке инициализации (например, не удалось загрузить fs/path)
    // логируем в консоль и продолжаем работу без файлового логирования
    console.warn("[Logger] Failed to initialize file logging modules, file logging disabled:", error);
    return false;
  }
}

// Типизация для webpack globals
declare const __webpack_require__: unknown;
declare const __non_webpack_require__: NodeRequire;

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  meta?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  url?: string;
  method?: string;
}

const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5; // Храним до 5 файлов ротации

function getLogsDir(): string {
  return path ? path.join(process.cwd(), "logs") : "";
}

function getErrorLogFile(): string {
  return path ? path.join(getLogsDir(), "errors.log") : "";
}

function getInfoLogFile(): string {
  return path ? path.join(getLogsDir(), "app.log") : "";
}

/**
 * Ротация логов при превышении размера
 */
function rotateLogFile(filePath: string): void {
  if (!fs) return;

  try {
    if (!fs.existsSync(filePath)) return;

    const stats = fs.statSync(filePath);
    if (stats.size < MAX_LOG_FILE_SIZE) return;

    // Удаляем самый старый файл
    const oldestFile = `${filePath}.${MAX_LOG_FILES}`;
    if (fs.existsSync(oldestFile)) {
      fs.unlinkSync(oldestFile);
    }

    // Сдвигаем файлы
    for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
      const oldFile = `${filePath}.${i}`;
      const newFile = `${filePath}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile);
      }
    }

    // Переименовываем текущий файл
    fs.renameSync(filePath, `${filePath}.1`);
  } catch {
    // Игнорируем ошибки ротации
  }
}

/**
 * Записывает лог в файл
 */
function writeToFile(entry: LogEntry, filePath: string): void {
  if (typeof window !== "undefined") return; // Не записываем на клиенте
  if (!initModules() || !fs) return;

  try {
    rotateLogFile(filePath);

    const logLine = JSON.stringify(entry) + "\n";
    fs.appendFileSync(filePath, logLine, { encoding: "utf-8" });
  } catch {
    // Игнорируем ошибки записи в файл
  }
}

/**
 * Форматирует ошибку для логирования
 */
function formatError(error: unknown): LogEntry["error"] | undefined {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return undefined;
}

/**
 * Создаёт запись лога
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    error: formatError(error),
    meta,
  };
}

/**
 * Выводит лог в консоль и файл
 */
function outputLog(entry: LogEntry): void {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const message = entry.message;

  // Вывод в консоль
  if (entry.level === "error") {
    console.error(prefix, message, entry.error || entry.meta || "");
    if (entry.error?.stack) {
      console.error(entry.error.stack);
    }
  } else if (entry.level === "warn") {
    console.warn(prefix, message, entry.meta || "");
  } else if (entry.level === "debug" && process.env.NODE_ENV === "development") {
    console.debug(prefix, message, entry.meta || "");
  } else {
    console.log(prefix, message, entry.meta || "");
  }

  // Запись в файл (только на сервере)
  if (typeof window === "undefined" && initModules()) {
    const errorLogFile = getErrorLogFile();
    const infoLogFile = getInfoLogFile();

    if (entry.level === "error" && errorLogFile) {
      writeToFile(entry, errorLogFile);
    }
    // В production записываем только важные логи
    if (process.env.NODE_ENV === "production") {
      if ((entry.level === "error" || entry.level === "warn") && infoLogFile) {
        writeToFile(entry, infoLogFile);
      }
    } else {
      // В development записываем все логи
      if (infoLogFile) {
        writeToFile(entry, infoLogFile);
      }
    }
  }
}

/**
 * Улучшенный логгер с записью в файл
 */
export const loggerEnhanced = {
  /**
   * Информационное сообщение
   */
  info: (message: string, meta?: Record<string, unknown>): void => {
    const entry = createLogEntry("info", message, undefined, meta);
    outputLog(entry);
  },

  /**
   * Предупреждение
   */
  warn: (message: string, meta?: Record<string, unknown>): void => {
    const entry = createLogEntry("warn", message, undefined, meta);
    outputLog(entry);
  },

  /**
   * Ошибка
   */
  error: (message: string, error?: unknown, meta?: Record<string, unknown>): void => {
    const entry = createLogEntry("error", message, error, meta);
    outputLog(entry);
  },

  /**
   * Отладочное сообщение (только в development)
   */
  debug: (message: string, meta?: Record<string, unknown>): void => {
    if (process.env.NODE_ENV === "development") {
      const entry = createLogEntry("debug", message, undefined, meta);
      outputLog(entry);
    }
  },
};
