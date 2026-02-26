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

export interface PaymentRequest {
  orderId: number;
  amount: number; // в копейках
  description: string;
  email?: string;
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
