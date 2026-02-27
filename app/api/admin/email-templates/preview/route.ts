/**
 * GET /api/admin/email-templates/preview?template=...
 * Возвращает HTML превью шаблона письма (только для админа). Для вёрстки в админке.
 */

import { createErrorResponse } from "@/shared/lib/api/error-response";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { EMAIL_RESPONSIVE_STYLE } from "@/shared/lib/styles";
import { formatMoneyHtml } from "@/shared/lib/formatters/format-money";
import { NextRequest, NextResponse } from "next/server";

const TEMPLATES = [
  "verification",
  "password-reset",
  "newsletter",
  "order",
  "order-status",
] as const;

type TemplateName = (typeof TEMPLATES)[number];

function isTemplate(name: string | null): name is TemplateName {
  return name != null && TEMPLATES.includes(name as TemplateName);
}

/** Плейсхолдер: на клиенте заменяется на window.location.origin, чтобы не грузить ресурсы с недоступного IP (например 172.x). */
const ORIGIN_PLACEHOLDER = "__ORIGIN__";

function buildPreviewHtml(template: TemplateName): string {
  const logoUrl = `${ORIGIN_PLACEHOLDER}/logo-icon.png`;

  switch (template) {
    case "verification": {
      const verificationUrl = `${ORIGIN_PLACEHOLDER}/api/auth/verify-email?token=sample-token`;
      return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${EMAIL_RESPONSIVE_STYLE}</head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div class="email-wrap" style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div class="email-header" style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div class="email-body" style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Подтвердите email</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Спасибо за регистрацию! Нажмите кнопку ниже для подтверждения:</p>
            <div class="email-cta-wrap" style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подтвердить</a>
            </div>
            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p class="email-link-block" style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${verificationUrl}</p>
            <p style="font-size: 13px; color: #999; margin-top: 24px;">Ссылка действительна 24 часа.</p>
          </div>
          <div class="email-footer" style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>`;
    }

    case "password-reset": {
      const resetUrl = `${ORIGIN_PLACEHOLDER}/auth/reset-password?token=sample-token`;
      return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${EMAIL_RESPONSIVE_STYLE}</head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div class="email-wrap" style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div class="email-header" style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div class="email-body" style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Сброс пароля</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Вы запросили сброс пароля. Нажмите кнопку ниже для создания нового:</p>
            <div class="email-cta-wrap" style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Сбросить пароль</a>
            </div>
            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p class="email-link-block" style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${resetUrl}</p>
            <p style="font-size: 13px; color: #999; margin-top: 24px;">Ссылка действительна 24 часа.</p>
            <div style="margin-top: 24px; padding: 12px 16px; background-color: #fef9e7; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; color: #7d6608;">Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
            </div>
          </div>
          <div class="email-footer" style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>`;
    }

    case "newsletter": {
      const confirmUrl = `${ORIGIN_PLACEHOLDER}/api/shop/newsletter/confirm?token=sample-token`;
      return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${EMAIL_RESPONSIVE_STYLE}</head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div class="email-wrap" style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div class="email-header" style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div class="email-body" style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 16px; font-size: 22px; font-weight: 600;">Подтвердите подписку на новости</h1>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">Вы подписались на рассылку новостей магазина h-sport. Нажмите кнопку ниже, чтобы подтвердить подписку.</p>
            <div class="email-cta-wrap" style="text-align: center; margin: 32px 0;">
              <a href="${confirmUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подтвердить подписку</a>
            </div>
            <p style="font-size: 13px; color: #999; margin: 24px 0 8px;">Или скопируйте ссылку:</p>
            <p class="email-link-block" style="word-break: break-all; font-size: 12px; color: #666; background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 0;">${confirmUrl}</p>
          </div>
          <div class="email-footer" style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>`;
    }

    case "order": {
      const orderUrl = `${ORIGIN_PLACEHOLDER}/account/orders/sample-uid`;
      const itemsHtml = `
      <tr>
        <td class="email-table-cell email-table-cell-name" style="padding: 14px 0; vertical-align: top;">
          <span style="font-weight: 500; color: #1a1a1a; font-size: 14px;">Футболка спортивная</span>
          <br><span style="font-size: 13px; color: #6b7280;">M · Чёрный</span>
        </td>
        <td class="email-table-cell" style="padding: 14px 0; text-align: center; color: #6b7280; font-size: 14px; vertical-align: top;">2 × ${formatMoneyHtml(300000)}</td>
        <td class="email-table-cell" style="padding: 14px 0; text-align: right; color: #EB6081; font-size: 14px; font-weight: 500; vertical-align: top;">${formatMoneyHtml(600000)}</td>
      </tr>
      <tr><td colspan="3" style="padding: 0; height: 1px; background-color: #EB6081; line-height: 0;"></td></tr>
      <tr>
        <td class="email-table-cell email-table-cell-name" style="padding: 14px 0; vertical-align: top;">
          <span style="font-weight: 500; color: #1a1a1a; font-size: 14px;">Леггинсы</span>
          <br><span style="font-size: 13px; color: #6b7280;">S</span>
        </td>
        <td class="email-table-cell" style="padding: 14px 0; text-align: center; color: #6b7280; font-size: 14px; vertical-align: top;">1 × ${formatMoneyHtml(250000)}</td>
        <td class="email-table-cell" style="padding: 14px 0; text-align: right; color: #EB6081; font-size: 14px; font-weight: 500; vertical-align: top;">${formatMoneyHtml(250000)}</td>
      </tr>`;
      return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${EMAIL_RESPONSIVE_STYLE}</head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div class="email-wrap" style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div class="email-header" style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div class="email-body" style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Заказ оформлен</h1>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Заказ #12345 принят. Мы скоро начнём его обработку.</p>
            <div class="email-order-block" style="background-color: #F4F0F0; border-radius: 10px; padding: 24px 28px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 500; color: #1a1a1a;">Ваш заказ</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="margin-top: 20px;">
                <div class="email-order-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                  <span style="color: #6b7280;">Товары</span>
                  <span style="color: #EB6081; font-weight: 500;">${formatMoneyHtml(850000)}</span>
                </div>
                <div class="email-order-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                  <span style="color: #6b7280;">Доставка</span>
                  <span style="color: #EB6081; font-weight: 500;">${formatMoneyHtml(35000)}</span>
                </div>
                <div class="email-order-row" style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                  <span style="color: #6b7280;">Промокод (PROMO10)</span>
                  <span style="color: #EB6081; font-weight: 500;">−${formatMoneyHtml(85000)}</span>
                </div>
                <div style="height: 1px; background-color: #EB6081; margin: 16px 0;"></div>
                <div class="email-order-total" style="display: flex; justify-content: space-between; align-items: center; font-size: 22px; font-weight: 500;">
                  <span style="color: #1a1a1a; text-transform: uppercase;">Итого</span>
                  <span style="color: #EB6081;">${formatMoneyHtml(815000)}</span>
                </div>
              </div>
            </div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">Доставка: Курьером CDEK · Москва · ул. Примерная, д. 1, кв. 10</div>
            <div class="email-cta-wrap" style="text-align: center; margin: 32px 0;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Посмотреть заказ</a>
            </div>
          </div>
          <div class="email-footer" style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>`;
    }

    case "order-status": {
      const orderUrl = `${ORIGIN_PLACEHOLDER}/account/orders/sample-uid`;
      const statusLabel = "Передан в доставку";
      const statusMessage = "Заказ передан в доставку. Трек: 1234567890";
      const statusColor = "#f59e0b";
      return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f8f8; margin: 0; padding: 0;">
        <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="padding: 32px 40px; border-bottom: 1px solid #f0f0f0;">
            <div style="display: flex; align-items: center;">
              <img src="${logoUrl}" alt="h-sport" style="width: 24px; height: 36px;" />
              <span style="margin-left: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;">h-sport</span>
            </div>
          </div>
          <div style="padding: 40px;">
            <h1 style="color: #1a1a1a; margin: 0 0 8px; font-size: 22px; font-weight: 600;">Заказ #12345</h1>
            <p style="color: #666; margin: 0 0 24px; font-size: 14px;">Статус вашего заказа обновлён</p>
            <div style="margin-bottom: 24px;">
              <span style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}; color: #ffffff; border-radius: 6px; font-weight: 500; font-size: 14px;">${statusLabel}</span>
            </div>
            <p style="color: #666; margin: 0 0 32px; font-size: 14px;">${statusMessage}</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 40px; background-color: #EB6081; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Подробнее</a>
            </div>
          </div>
          <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">© ${new Date().getFullYear()} h-sport</p>
          </div>
        </div>
      </body>
    </html>`;
    }
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template");

  if (!isTemplate(template)) {
    return createErrorResponse(
      "Укажите template: verification | password-reset | newsletter | order | order-status",
      400
    );
  }

  const html = buildPreviewHtml(template);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
