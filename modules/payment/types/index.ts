/**
 * Типы для модуля оплаты
 */

export interface PaymentConfig {
  merchantLogin: string;
  password1: string;
  password2: string;
  isTest?: boolean;
  hashAlgorithm?: "md5" | "sha256" | "sha512";
  url?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  sum: number; // в рублях за всё количество
  payment_method: "full_payment";
  payment_object: "commodity" | "service";
  tax: "none" | "vat0" | "vat10" | "vat20" | "vat5" | "vat7";
}

export interface PaymentRequest {
  orderId: number;
  amount: number; // в копейках
  description: string;
  email?: string;
  receiptItems?: ReceiptItem[];
  userParameters?: Record<string, string>;
}

export interface PaymentUrlResponse {
  url: string;
}

export interface RobokassaWebhook {
  InvId: string;
  OutSum: string;
  SignatureValue: string;
  Shp_?: Record<string, string>;
}

export interface PaymentStatus {
  orderId: number;
  paymentId: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";
  externalId?: string;
}
