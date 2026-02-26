/**
 * Простая in-memory очередь для асинхронной отправки email
 * Бесплатная альтернатива Bull/BullMQ для небольших проектов
 */

import { logger } from "@/shared/lib/logger";

type EmailTask = {
  to: string;
  subject: string;
  html: string;
  retries: number;
  createdAt: number;
};

const emailQueue: EmailTask[] = [];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 секунд между попытками
const MAX_QUEUE_SIZE = 1000; // Максимальный размер очереди
let isProcessing = false;

/**
 * Добавляет email в очередь для асинхронной отправки
 */
export function queueEmail(
  to: string,
  subject: string,
  html: string,
): void {
  // Проверяем размер очереди
  if (emailQueue.length >= MAX_QUEUE_SIZE) {
    logger.warn("Email queue is full, dropping email", {
      to,
      subject,
      queueSize: emailQueue.length,
    });
    return;
  }

  emailQueue.push({
    to,
    subject,
    html,
    retries: 0,
    createdAt: Date.now(),
  });

  // Запускаем обработку очереди, если она еще не запущена
  if (!isProcessing) {
    processEmailQueue().catch((error) => {
      logger.error("Error processing email queue", error);
    });
  }
}

/**
 * Обрабатывает очередь email
 */
async function processEmailQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (emailQueue.length > 0) {
      const task = emailQueue.shift();
      if (!task) break;

      try {
        const { sendEmail } = await import("./email");
        await sendEmail(task.to, task.subject, task.html);
        logger.info("Email sent from queue", {
          to: task.to,
          subject: task.subject,
        });
      } catch (error) {
        // Если не превышен лимит попыток, возвращаем задачу в очередь
        if (task.retries < MAX_RETRIES) {
          task.retries += 1;
          // Добавляем задержку перед повторной попыткой
          const retryTimeout = setTimeout(() => {
            emailQueue.push(task);
            if (!isProcessing) {
              processEmailQueue().catch((err) => {
                logger.error("Error processing email queue", err);
              });
            }
          }, RETRY_DELAY_MS * task.retries);
          // Используем .unref() чтобы таймер не блокировал завершение процесса
          if (retryTimeout && typeof retryTimeout.unref === "function") {
            retryTimeout.unref();
          }
        } else {
          logger.error("Failed to send email after max retries", {
            to: task.to,
            subject: task.subject,
            retries: task.retries,
            error,
          });
        }
      }

      // Небольшая задержка между отправками, чтобы не перегружать SMTP
      await new Promise<void>((resolve) => {
        const delayTimeout = setTimeout(() => resolve(), 100);
        // Используем .unref() чтобы таймер не блокировал завершение процесса
        if (delayTimeout && typeof delayTimeout.unref === "function") {
          delayTimeout.unref();
        }
      });
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Получает статистику очереди
 */
export function getEmailQueueStats(): {
  queueSize: number;
  isProcessing: boolean;
} {
  return {
    queueSize: emailQueue.length,
    isProcessing,
  };
}
