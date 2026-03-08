/**
 * Генерация PDF-чека об оплате.
 */

import { formatMoney } from "@/shared/lib/formatters";
import type { ReceiptData } from "./receipt.service";

/** Минимальный тип для PDFKit-документа (методы, используемые при рендере). */
type PdfDoc = {
  font: (name: string) => PdfDoc;
  fontSize: (size: number) => PdfDoc;
  text: (text: string, ...args: unknown[]) => PdfDoc;
  moveDown: (n?: number) => PdfDoc;
  y: number;
  fillColor: (color: string) => PdfDoc;
  on: (event: string, fn: (...args: unknown[]) => void) => PdfDoc;
  end: () => void;
};

/**
 * Собирает PDF-документ в Buffer из ReceiptData.
 */
export async function buildReceiptPdf(data: ReceiptData): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default as new (opts?: {
    size?: string;
    margin?: number;
  }) => PdfDoc & { on: (e: string, fn: (chunk: Buffer) => void) => void };
  const doc = new PDFDocument({ size: "A4", margin: 50 }) as PdfDoc & {
    on: (e: string, fn: (chunk: Buffer) => void) => void;
  };
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  await new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", reject);
    try {
      renderReceipt(doc, data);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });

  return Buffer.concat(chunks);
}

function renderReceipt(doc: PdfDoc, data: ReceiptData): void {
  const { payment, order } = data;
  const dateStr = new Date(payment.updatedAt).toLocaleString("ru-RU");

  doc.fontSize(18).font("Helvetica-Bold").text("Чек об оплате", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica").text(`Заказ №${order.id}`, { align: "center" });
  doc.moveDown(1.5);

  doc.font("Helvetica").fontSize(10);
  doc.text(`Дата оплаты: ${dateStr}`);
  doc.text(`ID платежа: ${payment.id}`);
  if (payment.externalId) doc.text(`Внешний ID: ${payment.externalId}`);
  doc.text(`Email: ${order.email}`);
  if (order.fullName) doc.text(`Получатель: ${order.fullName}`);
  doc.moveDown(1);

  doc.font("Helvetica-Bold").text("Товары", { continued: false });
  doc.moveDown(0.5);
  doc.font("Helvetica");

  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(9);
  doc.text("Товар", 50, tableTop);
  doc.text("Кол-во", 320, tableTop, { width: 40, align: "center" });
  doc.text("Цена", 370, tableTop, { width: 80, align: "right" });
  doc.text("Сумма", 450, tableTop, { width: 90, align: "right" });
  doc.font("Helvetica").fontSize(10);

  let y = tableTop + 18;
  for (const item of order.items) {
    const name = `${item.productName}${item.size ? `, размер: ${item.size}` : ""}${item.color ? `, цвет: ${item.color}` : ""}`;
    doc.text(name.slice(0, 50) + (name.length > 50 ? "…" : ""), 50, y, { width: 260 });
    doc.text(String(item.qty), 320, y, { width: 40, align: "center" });
    doc.text(formatMoney(item.price), 370, y, { width: 80, align: "right" });
    doc.text(formatMoney(item.total), 450, y, { width: 90, align: "right" });
    y += 20;
  }

  doc.y = y + 10;
  if (order.subtotal != null) {
    doc.text(`Товары: ${formatMoney(order.subtotal)}`, 350, doc.y, { align: "right" });
    doc.moveDown(0.3);
  }
  if (order.discount > 0) {
    doc.text(
      `Скидка${order.promoCodeCode ? ` (${order.promoCodeCode})` : ""}: -${formatMoney(order.discount)}`,
      350,
      doc.y,
      { align: "right" }
    );
    doc.moveDown(0.3);
  }
  if (order.deliveryFee > 0) {
    doc.text(`Доставка: ${formatMoney(order.deliveryFee)}`, 350, doc.y, { align: "right" });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text(`Итого: ${formatMoney(order.total)}`, 350, doc.y, { align: "right" });

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(9).fillColor("#666666");
  doc.text("Спасибо за покупку!", { align: "center" });
  doc.text(`© ${new Date().getFullYear()} H-Sport`, { align: "center" });
}
