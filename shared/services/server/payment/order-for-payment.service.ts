/**
 * Сервис для получения данных заказа в контексте платежей.
 * Маршруты payment/create и payment/success не должны импортировать репозитории напрямую (план B.1).
 */

import { OrdersRepository } from "@/shared/repositories/orders.repository";

export const OrderForPaymentService = {
  /**
   * Заказ с минимальным набором полей для создания платежа (проверка суммы и существования).
   */
  async getOrderForPaymentCreate(orderId: number) {
    return OrdersRepository.findForPaymentCreate(orderId);
  },

  /**
   * Заказ с полями для отправки email после успешной оплаты (success URL).
   */
  async getOrderForSuccessEmail(orderId: number) {
    return OrdersRepository.findForEmail(orderId);
  },
};
