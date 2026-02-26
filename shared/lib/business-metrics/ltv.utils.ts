/**
 * Утилиты для расчета LTV (Lifetime Value)
 */

export interface CustomerOrder {
  orderCount: number;
  totalSpent: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
}

/**
 * Рассчитывает средний LTV
 */
export function calculateAverageLTV(customers: CustomerOrder[]): number {
  if (customers.length === 0) return 0;

  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  return Math.round(totalSpent / customers.length);
}

/**
 * Рассчитывает процент повторных клиентов
 */
export function calculateRepeatCustomerRate(
  repeatCustomers: number,
  totalCustomers: number
): number {
  if (totalCustomers === 0) return 0;
  return Math.round((repeatCustomers / totalCustomers) * 100 * 100) / 100;
}

/**
 * Рассчитывает среднее количество заказов на клиента
 */
export function calculateAverageOrdersPerCustomer(
  totalOrders: number,
  totalCustomers: number
): number {
  if (totalCustomers === 0) return 0;
  return Math.round((totalOrders / totalCustomers) * 100) / 100;
}
