import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { buildReceiptPdf } from "@/shared/services/server/payment/receipt-pdf.service";
import { getReceiptById } from "@/shared/services/server/payment/receipt.service";
import { formatMoney } from "@/shared/lib/formatters";
import type { RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type RouteContext = RouteParams<{ id: string }>;

export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "public");
      if (rateLimitResponse) return rateLimitResponse;

      const { id } = await context.params;
      const paymentId = parseInt(id, 10);

      if (isNaN(paymentId)) {
        return createErrorResponse("Неверный ID платежа", 400);
      }

      const session = await getSessionUserOrError(req);
      if ("error" in session) return session.error;

      const data = await getReceiptById(paymentId);

      if (!data) {
        return createErrorResponse("Платеж не найден", 404);
      }

      const { payment, order } = data;
      if (order.userId == null || order.userId !== session.user.id) {
        return createErrorResponse("Доступ запрещён", 403);
      }

      const format = req.nextUrl.searchParams.get("format");
      if (format === "pdf") {
        const pdfBuffer = await buildReceiptPdf(data);
        const filename = `receipt-order-${order.id}.pdf`;
        return new NextResponse(new Uint8Array(pdfBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Чек об оплате заказа №${escapeHtml(String(order.id))}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .info {
              margin: 20px 0;
            }
            .info-row {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row td:first-child {
              font-weight: 600;
            }
            .info-row td:last-child {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
              font-weight: 600;
            }
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: 600;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Чек об оплате</h1>
            <p>Заказ №${order.id}</p>
          </div>

          <div class="info">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tbody>
            <tr class="info-row">
              <td><span class="info-label">Дата оплаты:</span></td>
              <td>${new Date(payment.updatedAt).toLocaleString("ru-RU")}</td>
            </tr>
            <tr class="info-row">
              <td><span class="info-label">ID платежа:</span></td>
              <td>${payment.id}</td>
            </tr>
            ${
              payment.externalId
                ? `
            <tr class="info-row">
              <td><span class="info-label">Внешний ID:</span></td>
              <td>${escapeHtml(payment.externalId)}</td>
            </tr>
            `
                : ""
            }
            <tr class="info-row">
              <td><span class="info-label">Email:</span></td>
              <td>${escapeHtml(order.email)}</td>
            </tr>
            ${
              order.fullName
                ? `
            <tr class="info-row">
              <td><span class="info-label">Получатель:</span></td>
              <td>${escapeHtml(order.fullName)}</td>
            </tr>
            `
                : ""
            }
            </tbody>
            </table>
          </div>

          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th style="text-align: center;">Кол-во</th>
                <th style="text-align: right;">Цена</th>
                <th style="text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    ${escapeHtml(item.productName)}
                    ${item.size ? `<br><small>Размер: ${escapeHtml(item.size)}</small>` : ""}
                    ${item.color ? `<br><small>Цвет: ${escapeHtml(item.color)}</small>` : ""}
                  </td>
                  <td style="text-align: center;">${item.qty}</td>
                  <td style="text-align: right;">${formatMoney(item.price)}</td>
                  <td style="text-align: right;">${formatMoney(item.total)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="info">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tbody>
            ${
              order.subtotal != null
                ? `
            <tr class="info-row">
              <td><span class="info-label">Товары:</span></td>
              <td>${formatMoney(order.subtotal)}</td>
            </tr>
            `
                : ""
            }
            ${
              order.discount > 0
                ? `
            <tr class="info-row">
              <td><span class="info-label">Скидка${order.promoCodeCode ? ` (${escapeHtml(order.promoCodeCode)})` : ""}:</span></td>
              <td>-${formatMoney(order.discount)}</td>
            </tr>
            `
                : ""
            }
            ${
              order.deliveryFee > 0
                ? `
            <tr class="info-row">
              <td><span class="info-label">Доставка:</span></td>
              <td>${formatMoney(order.deliveryFee)}</td>
            </tr>
            `
                : ""
            }
            </tbody>
            </table>
          </div>

          <div class="total">
            Итого: ${formatMoney(order.total)}
          </div>

          <div class="footer">
            <p>Спасибо за покупку!</p>
            <p>© ${new Date().getFullYear()} H-Sport. Все права защищены.</p>
          </div>
        </body>
      </html>
    `;

      return new NextResponse(receiptHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    },
    request,
    "GET /api/payment/receipt/[id]"
  );
}
