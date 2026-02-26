import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { getReceiptById } from "@/shared/services/server/payment/receipt.service";
import { formatMoney } from "@/shared/lib";
import type { RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  return withErrorHandling(
    async () => {
      const { id } = await context.params;
      const paymentId = parseInt(id, 10);

      if (isNaN(paymentId)) {
        return createErrorResponse("Неверный ID платежа", 400);
      }

      const data = await getReceiptById(paymentId);

      if (!data) {
        return createErrorResponse("Платеж не найден", 404);
      }

      const { payment, order } = data;

      const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Чек об оплате заказа №${order.id}</title>
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
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: 600;
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
            <div class="info-row">
              <span class="info-label">Дата оплаты:</span>
              <span>${new Date(payment.updatedAt).toLocaleString("ru-RU")}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID платежа:</span>
              <span>${payment.id}</span>
            </div>
            ${payment.externalId ? `
            <div class="info-row">
              <span class="info-label">Внешний ID:</span>
              <span>${payment.externalId}</span>
            </div>
            ` : ""}
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span>${order.email}</span>
            </div>
            ${order.fullName ? `
            <div class="info-row">
              <span class="info-label">Получатель:</span>
              <span>${order.fullName}</span>
            </div>
            ` : ""}
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
              ${order.items.map((item) => `
                <tr>
                  <td>
                    ${item.productName}
                    ${item.size ? `<br><small>Размер: ${item.size}</small>` : ""}
                    ${item.color ? `<br><small>Цвет: ${item.color}</small>` : ""}
                  </td>
                  <td style="text-align: center;">${item.qty}</td>
                  <td style="text-align: right;">${formatMoney(item.price)}</td>
                  <td style="text-align: right;">${formatMoney(item.total)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="info">
            ${order.subtotal != null ? `
            <div class="info-row">
              <span class="info-label">Товары:</span>
              <span>${formatMoney(order.subtotal)}</span>
            </div>
            ` : ""}
            ${order.discount > 0 ? `
            <div class="info-row">
              <span class="info-label">Скидка${order.promoCodeCode ? ` (${order.promoCodeCode})` : ""}:</span>
              <span>-${formatMoney(order.discount)}</span>
            </div>
            ` : ""}
            ${order.deliveryFee > 0 ? `
            <div class="info-row">
              <span class="info-label">Доставка:</span>
              <span>${formatMoney(order.deliveryFee)}</span>
            </div>
            ` : ""}
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
    "GET /api/payment/receipt/[id]",
  );
}
