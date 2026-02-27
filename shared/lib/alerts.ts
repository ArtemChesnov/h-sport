/**
 * Система алертов для мониторинга критических ошибок (5xx)
 * Бесплатная альтернатива Sentry для мониторинга ошибок
 */

import { env } from "@/shared/lib/config/env";

// fs и path импортируются динамически только на сервере
let fs: typeof import("fs") | null = null;
let path: typeof import("path") | null = null;
let initialized = false;

// Ленивая инициализация модулей
function initModules(): boolean {
  if (typeof window !== "undefined") return false;
  if (initialized) return !!fs;
  initialized = true;

  try {
    // Используем динамический require чтобы webpack не пытался разрешить модули на клиенте
    const requireFn = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
    fs = requireFn("fs");
    path = requireFn("path");
    return true;
  } catch {
    return false;
  }
}

// Типизация для webpack globals
declare const __webpack_require__: unknown;
declare const __non_webpack_require__: NodeRequire;

export interface AlertEntry {
  timestamp: string;
  type: "5xx" | "critical" | "warning";
  statusCode?: number;
  endpoint?: string;
  method?: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  ip?: string;
}

// Конфигурация алертов
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

function getAlertsDir(): string {
  initModules();
  return path ? path.join(process.cwd(), "logs") : "";
}

function getAlertsFile(): string {
  return path ? path.join(getAlertsDir(), "alerts.log") : "";
}

function getCriticalAlertsFile(): string {
  return path ? path.join(getAlertsDir(), "critical-alerts.log") : "";
}

// In-memory буфер для агрегации ошибок (для отчётов)
interface AlertStats {
  count: number;
  firstSeen: string;
  lastSeen: string;
  endpoints: Map<string, number>;
}

const alertsBuffer = new Map<string, AlertStats>();

// Rate limiting для email-алертов: не более 1 письма на endpoint каждые 15 минут
const EMAIL_ALERT_RATE_LIMIT_MS = 15 * 60 * 1000; // 15 минут
const emailAlertLastSent = new Map<string, number>(); // endpoint -> timestamp последней отправки

/**
 * Создаёт директорию для логов если нужно
 */
function ensureLogsDir(): void {
  if (typeof window !== "undefined") return;
  initModules();
  if (!fs) return;

  try {
    const alertsDir = getAlertsDir();
    if (alertsDir && !fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true });
    }
  } catch {
    // Игнорируем ошибки создания директории
  }
}

/**
 * Ротация файла алертов
 */
function rotateFile(filePath: string): void {
  if (!fs) return;

  try {
    if (!fs.existsSync(filePath)) return;

    const stats = fs.statSync(filePath);
    if (stats.size < MAX_FILE_SIZE) return;

    // Удаляем самый старый файл
    const oldestFile = `${filePath}.${MAX_FILES}`;
    if (fs.existsSync(oldestFile)) {
      fs.unlinkSync(oldestFile);
    }

    // Сдвигаем файлы
    for (let i = MAX_FILES - 1; i >= 1; i--) {
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
 * Записывает алерт в файл
 */
function writeAlert(entry: AlertEntry, isCritical: boolean = false): void {
  if (typeof window !== "undefined") return;
  initModules();
  if (!fs) return;

  ensureLogsDir();

  try {
    const filePath = isCritical ? getCriticalAlertsFile() : getAlertsFile();
    if (!filePath) return;

    rotateFile(filePath);

    const logLine = JSON.stringify(entry) + "\n";
    fs.appendFileSync(filePath, logLine, { encoding: "utf-8" });
  } catch {
    // Игнорируем ошибки записи
  }
}

/**
 * Обновляет статистику алертов в памяти
 */
function updateStats(entry: AlertEntry): void {
  const key = `${entry.type}:${entry.statusCode || "unknown"}`;
  const now = entry.timestamp;

  const existing = alertsBuffer.get(key);
  if (existing) {
    existing.count++;
    existing.lastSeen = now;
    if (entry.endpoint) {
      existing.endpoints.set(entry.endpoint, (existing.endpoints.get(entry.endpoint) || 0) + 1);
    }
  } else {
    const endpoints = new Map<string, number>();
    if (entry.endpoint) {
      endpoints.set(entry.endpoint, 1);
    }
    alertsBuffer.set(key, {
      count: 1,
      firstSeen: now,
      lastSeen: now,
      endpoints,
    });
  }
}

/**
 * Отправляет 5xx алерт
 */
export function alert5xx(params: {
  statusCode: number;
  endpoint: string;
  method: string;
  message: string;
  error?: Error | unknown;
  requestId?: string;
  userId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}): void {
  const entry: AlertEntry = {
    timestamp: new Date().toISOString(),
    type: "5xx",
    statusCode: params.statusCode,
    endpoint: params.endpoint,
    method: params.method,
    message: params.message,
    requestId: params.requestId,
    userId: params.userId,
    ip: params.ip,
    meta: params.meta,
  };

  if (params.error instanceof Error) {
    entry.error = {
      name: params.error.name,
      message: params.error.message,
      stack: params.error.stack,
    };
  }

  // Критические ошибки - 500, 502, 503, 504
  const isCritical = [500, 502, 503, 504].includes(params.statusCode);

  writeAlert(entry, isCritical);
  updateStats(entry);

  // Отправляем уведомления (webhook/email) для всех 5xx ошибок в production
  if (env.NODE_ENV === "production") {
    sendAlertNotification(entry).catch(() => {
      // Игнорируем ошибки отправки
    });
  }
}

/**
 * Отправляет критический алерт
 */
export function alertCritical(params: {
  message: string;
  error?: Error | unknown;
  meta?: Record<string, unknown>;
}): void {
  const entry: AlertEntry = {
    timestamp: new Date().toISOString(),
    type: "critical",
    message: params.message,
    meta: params.meta,
  };

  if (params.error instanceof Error) {
    entry.error = {
      name: params.error.name,
      message: params.error.message,
      stack: params.error.stack,
    };
  }

  writeAlert(entry, true);
  updateStats(entry);

  // Отправляем уведомление в production
  if (env.NODE_ENV === "production") {
    sendAlertNotification(entry).catch(() => {
      // Игнорируем ошибки отправки
    });
  }
}

/**
 * Отправляет email-алерт с rate limiting
 * Не более 1 письма на endpoint каждые 15 минут
 */
async function sendEmailAlert(entry: AlertEntry): Promise<void> {
  const alertEmail = env.ALERT_EMAIL;

  if (!alertEmail) {
    return; // Email для алертов не настроен
  }

  // Rate limiting: проверяем, отправляли ли мы уже письмо для этого endpoint
  const endpoint = entry.endpoint || "unknown";
  const now = Date.now();
  const lastSent = emailAlertLastSent.get(endpoint);

  if (lastSent && now - lastSent < EMAIL_ALERT_RATE_LIMIT_MS) {
    return; // Уже отправляли недавно, пропускаем
  }

  try {
    // Динамический импорт модуля email (избегаем циклических зависимостей)
    const { sendEmail } = await import("@/modules/auth/lib/email");

    // Формируем тему письма
    const subject = `[H-Sport Alert] ${entry.statusCode || entry.type.toUpperCase()} Error on ${endpoint}`;

    // Формируем HTML тело письма
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 ${entry.type.toUpperCase()} Alert</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Status Code:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.statusCode || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Endpoint:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.endpoint || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Method:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.method || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Time:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.timestamp}</td>
          </tr>
          ${
            entry.ip
              ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">IP:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.ip}</td>
          </tr>
          `
              : ""
          }
          ${
            entry.userId
              ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">User ID:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.userId}</td>
          </tr>
          `
              : ""
          }
        </table>
        <h3 style="color: #dc2626; margin-top: 20px;">Message:</h3>
        <div style="padding: 12px; background-color: #f5f5f5; border-left: 4px solid #dc2626; margin: 10px 0;">
          ${entry.message}
        </div>
    `;

    if (entry.error) {
      html += `
        <h3 style="color: #dc2626; margin-top: 20px;">Error Details:</h3>
        <div style="padding: 12px; background-color: #f5f5f5; border-left: 4px solid #dc2626; margin: 10px 0;">
          <p><strong>Name:</strong> ${entry.error.name}</p>
          <p><strong>Message:</strong> ${entry.error.message}</p>
          ${
            entry.error.stack
              ? `
          <pre style="background-color: #1f1f1f; color: #f0f0f0; padding: 12px; overflow-x: auto; border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;">${entry.error.stack}</pre>
          `
              : ""
          }
        </div>
      `;
    }

    if (entry.meta && Object.keys(entry.meta).length > 0) {
      html += `
        <h3 style="color: #dc2626; margin-top: 20px;">Additional Info:</h3>
        <pre style="background-color: #f5f5f5; padding: 12px; overflow-x: auto; border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(entry.meta, null, 2)}</pre>
      `;
    }

    html += `
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This is an automated alert from H-Sport monitoring system.
        </p>
      </div>
    `;

    await sendEmail(alertEmail, subject, html);

    // Обновляем timestamp последней отправки
    emailAlertLastSent.set(endpoint, now);
  } catch {
    // Игнорируем ошибки отправки email
  }
}

/**
 * Отправляет уведомление об алерте (webhook/email)
 * Можно настроить на Discord, Slack, Telegram или email
 */
async function sendAlertNotification(entry: AlertEntry): Promise<void> {
  // Отправляем webhook (если настроен)
  const webhookUrl = env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const payload = {
        text: `🚨 ${entry.type.toUpperCase()} Alert`,
        attachments: [
          {
            color: entry.type === "critical" ? "danger" : "warning",
            fields: [
              { title: "Message", value: entry.message, short: false },
              { title: "Endpoint", value: entry.endpoint || "N/A", short: true },
              { title: "Status", value: String(entry.statusCode || "N/A"), short: true },
              { title: "Time", value: entry.timestamp, short: true },
            ],
          },
        ],
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Игнорируем ошибки отправки webhook
    }
  }

  // Отправляем email (если настроен)
  await sendEmailAlert(entry).catch(() => {
    // Игнорируем ошибки отправки email
  });
}

/**
 * Получает статистику алертов за период
 */
export function getAlertStats(): {
  total: number;
  by5xx: Record<number, number>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
} {
  let total = 0;
  const by5xx: Record<number, number> = {};
  const endpointsMap = new Map<string, number>();

  alertsBuffer.forEach((stats, key) => {
    total += stats.count;

    const [type, code] = key.split(":");
    if (type === "5xx" && code) {
      const statusCode = parseInt(code, 10);
      by5xx[statusCode] = (by5xx[statusCode] || 0) + stats.count;
    }

    stats.endpoints.forEach((count, endpoint) => {
      endpointsMap.set(endpoint, (endpointsMap.get(endpoint) || 0) + count);
    });
  });

  const topEndpoints = Array.from(endpointsMap.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return { total, by5xx, topEndpoints };
}

/**
 * Сбрасывает статистику алертов
 */
export function resetAlertStats(): void {
  alertsBuffer.clear();
}
