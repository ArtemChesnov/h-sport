/**
 * Утилиты для отправки email
 */

import { getAppUrl } from "@/shared/lib/config/env";
import { formatMoneyHtml as formatMoney } from "@/shared/lib/formatters/format-money";
import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Инициализирует транспортер для отправки email
 */
export function initEmailTransporter(config: EmailConfig): void {
  // Проверяем env-флаг для разрешения небезопасного TLS (только для тестовых серверов)
  const allowInsecureTls = process.env.SMTP_ALLOW_INSECURE_TLS === "true";

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    // Для порта 587 (STARTTLS) устанавливаем rejectUnauthorized только если явно разрешено
    ...(config.port === 587 && !config.secure && allowInsecureTls
      ? {
          tls: {
            rejectUnauthorized: false, // Только если SMTP_ALLOW_INSECURE_TLS=true
          },
        }
      : {}),
  });
}

/**
 * Получает конфигурацию из переменных окружения
 */
export function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !password || !from) {
    return null;
  }

  const parsedPort = parseInt(port, 10);

  if (Number.isNaN(parsedPort)) {
    return null;
  }

  // Порт 465 использует SSL/TLS напрямую (secure: true)
  // Порт 587 использует STARTTLS (secure: false, но требует tls в nodemailer)
  return {
    host,
    port: parsedPort,
    secure: parsedPort === 465, // для 465 – true (SSL), для 587 – false (STARTTLS)
    user,
    password,
    from,
  };
}

/**
 * Отправляет email (синхронно, для внутреннего использования)
 * Для публичного API используйте sendEmailAsync
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    const config = getEmailConfig();
    if (!config) {
      const { logger } = await import("@/shared/lib/logger");
      logger.error("Email transporter not configured. Check SMTP_* environment variables.");
      throw new Error("Email transporter not configured");
    }
    initEmailTransporter(config);
  }

  if (!transporter) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Failed to initialize email transporter");
    throw new Error("Failed to initialize email transporter");
  }

  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    const { logger } = await import("@/shared/lib/logger");
    logger.info(`Email sent successfully to ${to}. MessageId: ${result.messageId}`);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Отправляет email асинхронно через очередь (не блокирует запрос)
 * Используйте эту функцию в API routes для неблокирующей отправки
 */
export function sendEmailAsync(to: string, subject: string, html: string): void {
  import("./email-queue").then(({ queueEmail }) => {
    queueEmail(to, subject, html);
  });
}

/**
 * Асинхронная версия sendVerificationEmail
 */
export function sendVerificationEmailAsync(email: string, token: string): void {
  // Генерируем HTML синхронно и добавляем в очередь
  sendVerificationEmail(email, token).catch(async (error) => {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Failed to queue verification email", error);
  });
}

/**
 * Асинхронная версия sendPasswordResetEmail
 */
export function sendPasswordResetEmailAsync(email: string, token: string): void {
  sendPasswordResetEmail(email, token).catch(async (error) => {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Failed to queue password reset email", error);
  });
}

/**
 * Асинхронная версия sendOrderConfirmationEmail
 */
export function sendOrderConfirmationEmailAsync(
  email: string,
  orderData: Parameters<typeof sendOrderConfirmationEmail>[1]
): void {
  // Генерируем HTML и добавляем в очередь
  const baseUrl = getAppUrl();
  const orderUrl = `${baseUrl}/account/orders/${orderData.uid}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  const itemsHtml = orderData.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding: 14px 0; vertical-align: top;">
          <span style="font-weight: 500; color: #1a1a1a; font-size: 14px;">${item.productName}</span>
          ${item.size || item.color ? `<br><span style="font-size: 13px; color: #6b7280;">${[item.size, item.color].filter(Boolean).join(" · ")}</span>` : ""}
        </td>
        <td style="padding: 14px 0; text-align: center; color: #6b7280; font-size: 14px; vertical-align: top;">${item.qty} × ${formatMoney(item.price)}</td>
        <td style="padding: 14px 0; text-align: right; color: #EB6081; font-size: 14px; font-weight: 500; vertical-align: top;">${formatMoney(item.qty * item.price)}</td>
      </tr>
      ${i < orderData.items.length - 1 ? '<tr><td colspan="3" style="padding: 0; height: 1px; background-color: #EB6081; line-height: 0;"></td></tr>' : ""}
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Заказ оформлен</h1>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Заказ #${orderData.id} принят. Мы скоро начнём его обработку.</p>

            <!-- Summary card (как в чекауте) -->
            <div style="background-color: #F4F0F0; border-radius: 10px; padding: 24px 28px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 500; color: #1a1a1a;">Ваш заказ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="margin-top: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
                  <tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Товары</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">${orderData.subtotal !== undefined ? formatMoney(orderData.subtotal) : formatMoney(orderData.items.reduce((s, i) => s + i.qty * i.price, 0))}</td></tr>
                  <tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Доставка</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">${orderData.deliveryFee === 0 || orderData.deliveryFee == null ? "Бесплатно" : formatMoney(orderData.deliveryFee)}</td></tr>
                ${orderData.discount ? `<tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Промокод${orderData.promoCode ? ` (${orderData.promoCode})` : ""}</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">−${formatMoney(orderData.discount)}</td></tr>` : ""}
                <tr><td colspan="2" style="height: 1px; background-color: #EB6081; padding: 0; line-height: 0;"></td></tr>
                <tr><td style="padding-top: 16px; padding-bottom: 0; color: #1a1a1a; font-size: 22px; font-weight: 500; text-transform: uppercase;">Итого</td><td style="text-align: right; padding-top: 16px; padding-bottom: 0; color: #EB6081; font-size: 22px; font-weight: 500;">${formatMoney(orderData.total)}</td></tr>
                </table>
              </div>
            </div>

            ${orderData.deliveryMethod || orderData.deliveryCity || orderData.deliveryAddress ? `<div style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">${orderData.deliveryMethod ? `Доставка: ${orderData.deliveryMethod}` : ""}${orderData.deliveryCity ? ` · ${orderData.deliveryCity}` : ""}${orderData.deliveryAddress ? ` · ${orderData.deliveryAddress}` : ""}</div>` : ""}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Посмотреть заказ</a>
            </div>
          </div>
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  sendEmailAsync(email, `Заказ #${orderData.id} оформлен`, html);
}

/**
 * Асинхронная версия sendOrderStatusChangeEmail
 */
export function sendOrderStatusChangeEmailAsync(
  email: string,
  orderData: Parameters<typeof sendOrderStatusChangeEmail>[1]
): void {
  sendOrderStatusChangeEmail(email, orderData).catch(async (error) => {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Failed to queue order status change email", error);
  });
}

/**
 * Отправляет email для подтверждения
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = getAppUrl();
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Подтвердите email</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Спасибо за регистрацию! Нажмите кнопку ниже для подтверждения:</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подтвердить</a>
            </div>

            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${verificationUrl}</p>

            <p style="font-size: 13px; color: #999; margin-top: 24px;">Ссылка действительна 24 часа.</p>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, "Подтвердите ваш email", html);
}

/**
 * Отправляет email для восстановления пароля
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const baseUrl = getAppUrl();
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Сброс пароля</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Вы запросили сброс пароля. Нажмите кнопку ниже для создания нового:</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Сбросить пароль</a>
            </div>

            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${resetUrl}</p>

            <p style="font-size: 13px; color: #999; margin-top: 24px;">Ссылка действительна 24 часа.</p>

            <div style="margin-top: 24px; padding: 12px 16px; background-color: #fef9e7; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; color: #7d6608;">Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, "Сброс пароля", html);
}

/**
 * Отправляет email для подтверждения подписки на рассылку новостей
 */
export async function sendNewsletterConfirmationEmail(email: string, token: string): Promise<void> {
  const baseUrl = getAppUrl();
  const confirmUrl = `${baseUrl}/api/shop/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Подтвердите подписку на новости</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Вы подписались на рассылку новостей магазина h-sport. Нажмите кнопку ниже, чтобы подтвердить подписку.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подтвердить подписку</a>
            </div>
            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${confirmUrl}</p>
          </div>
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, "Подтвердите подписку на новости h-sport", html);
}

/**
 * Асинхронная версия sendNewsletterConfirmationEmail (через очередь)
 */
export function sendNewsletterConfirmationEmailAsync(email: string, token: string): void {
  sendNewsletterConfirmationEmail(email, token).catch(async (error) => {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Failed to queue newsletter confirmation email", error);
  });
}

/**
 * Отправляет email о создании заказа
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    id: number;
    uid: string;
    total: number;
    totalItems: number;
    items: Array<{
      productName: string;
      qty: number;
      price: number;
      size?: string | null;
      color?: string | null;
    }>;
    deliveryMethod?: string | null;
    deliveryAddress?: string | null;
    deliveryCity?: string | null;
    promoCode?: string | null;
    discount?: number;
    deliveryFee?: number;
    subtotal?: number;
  }
): Promise<void> {
  const baseUrl = getAppUrl();
  const orderUrl = `${baseUrl}/account/orders/${orderData.uid}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  const itemsHtml = orderData.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding: 14px 0; vertical-align: top;">
          <span style="font-weight: 500; color: #1a1a1a; font-size: 14px;">${item.productName}</span>
          ${item.size || item.color ? `<br><span style="font-size: 13px; color: #6b7280;">${[item.size, item.color].filter(Boolean).join(" · ")}</span>` : ""}
        </td>
        <td style="padding: 14px 0; text-align: center; color: #6b7280; font-size: 14px; vertical-align: top;">${item.qty} × ${formatMoney(item.price)}</td>
        <td style="padding: 14px 0; text-align: right; color: #EB6081; font-size: 14px; font-weight: 500; vertical-align: top;">${formatMoney(item.qty * item.price)}</td>
      </tr>
      ${i < orderData.items.length - 1 ? '<tr><td colspan="3" style="padding: 0; height: 1px; background-color: #EB6081; line-height: 0;"></td></tr>' : ""}
    `
    )
    .join("");

  const subtotalDisplay =
    orderData.subtotal !== undefined
      ? formatMoney(orderData.subtotal)
      : formatMoney(orderData.items.reduce((s, i) => s + i.qty * i.price, 0));
  const deliveryDisplay =
    orderData.deliveryFee === 0 || orderData.deliveryFee == null
      ? "Бесплатно"
      : formatMoney(orderData.deliveryFee);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Заказ оформлен</h1>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Заказ #${orderData.id} принят. Мы скоро начнём его обработку.</p>

            <div style="background-color: #F4F0F0; border-radius: 10px; padding: 24px 28px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 500; color: #1a1a1a;">Ваш заказ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="margin-top: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
                  <tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Товары</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">${subtotalDisplay}</td></tr>
                  <tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Доставка</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">${deliveryDisplay}</td></tr>
                ${orderData.discount ? `<tr><td style="color: #6b7280; font-size: 14px; padding-bottom: 12px;">Промокод${orderData.promoCode ? ` (${orderData.promoCode})` : ""}</td><td style="text-align: right; color: #EB6081; font-weight: 500; font-size: 14px; padding-bottom: 12px;">−${formatMoney(orderData.discount)}</td></tr>` : ""}
                <tr><td colspan="2" style="height: 1px; background-color: #EB6081; padding: 0; line-height: 0;"></td></tr>
                <tr><td style="padding-top: 16px; padding-bottom: 0; color: #1a1a1a; font-size: 22px; font-weight: 500; text-transform: uppercase;">Итого</td><td style="text-align: right; padding-top: 16px; padding-bottom: 0; color: #EB6081; font-size: 22px; font-weight: 500;">${formatMoney(orderData.total)}</td></tr>
                </table>
              </div>
            </div>

            ${orderData.deliveryMethod || orderData.deliveryCity || orderData.deliveryAddress ? `<div style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">${orderData.deliveryMethod ? `Доставка: ${orderData.deliveryMethod}` : ""}${orderData.deliveryCity ? ` · ${orderData.deliveryCity}` : ""}${orderData.deliveryAddress ? ` · ${orderData.deliveryAddress}` : ""}</div>` : ""}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Посмотреть заказ</a>
            </div>
          </div>
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, `Заказ #${orderData.id} оформлен`, html);
}

/**
 * Отправляет email об изменении статуса заказа
 */
export async function sendOrderStatusChangeEmail(
  email: string,
  orderData: {
    id: number;
    uid: string;
    status: string;
    statusLabel: string;
    trackingCode?: string | null;
  }
): Promise<void> {
  const baseUrl = getAppUrl();
  const orderUrl = `${baseUrl}/account/orders/${orderData.uid}`;
  const logoUrl = `${baseUrl}/logo-icon.png`;

  // Определяем сообщение и цвет в зависимости от статуса
  let statusMessage = "";
  let statusColor = "#EB6081";

  switch (orderData.status) {
    case "PAID":
      statusMessage = "Заказ оплачен. Мы начнём обработку в ближайшее время.";
      statusColor = "#22c55e";
      break;
    case "PROCESSING":
      statusMessage = "Заказ в обработке. Готовим к отправке.";
      statusColor = "#3b82f6";
      break;
    case "SHIPPED":
      statusMessage = orderData.trackingCode
        ? `Заказ передан в доставку. Трек: ${orderData.trackingCode}`
        : "Заказ передан в доставку.";
      statusColor = "#f59e0b";
      break;
    case "DELIVERED":
      statusMessage = "Заказ доставлен! Спасибо за покупку.";
      statusColor = "#22c55e";
      break;
    case "CANCELED":
      statusMessage = "Заказ отменён. Если есть вопросы — напишите нам.";
      statusColor = "#ef4444";
      break;
    default:
      statusMessage = `Статус изменён на «${orderData.statusLabel}».`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Заказ #${orderData.id}</h1>
            <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Статус вашего заказа обновлён</p>

            <!-- Status Badge -->
            <div style="margin-bottom: 24px;">
              <span style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}; color: #ffffff; border-radius: 6px; font-weight: 500; font-size: 14px;">${orderData.statusLabel}</span>
            </div>

            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">${statusMessage}</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подробнее</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(email, `Заказ #${orderData.id} — ${orderData.statusLabel}`, html);
}
