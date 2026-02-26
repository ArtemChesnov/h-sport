import type * as DTO from "../../dto";
import { ApiRoutes, axiosInstance } from "../../http";
import { getApiErrorMessage } from "../api-errors";

export interface BusinessMetricsResponse {
  period: DTO.AdminDashboardPeriodDto;
  from: string;
  to: string;
  abandonedCarts: {
    total: number;
    totalValue: number;
    averageValue: number;
    withPromoCode: number;
    topProducts: Array<{ id: number; name: string; slug: string; count: number }>;
    byHour: Array<{ hour: number; count: number }>;
    /** Процент брошенных корзин от общего числа корзин с товарами */
    abandonmentRate?: number;
  };
  ltv: {
    totalCustomers: number;
    repeatCustomersCount: number;
    repeatCustomersRate: number;
    averageLTV: number;
    topCustomers: Array<{ userId: string; orderCount: number; totalSpent: number }>;
    averageOrdersPerCustomer: number;
  };
  promoCodes: {
    total: number;
    usageRate: number;
    effectiveness: Array<{
      id: number;
      code: string;
      type: string;
      value: number;
      usageCount: number;
      totalDiscount: number;
      totalRevenue: number;
      averageOrderValue: number;
      roi: number;
      avgDiscountPerOrder: number;
    }>;
  };
  productVariants: {
    sizes: Array<{ size: string; count: number; revenue: number }>;
    colors: Array<{ color: string; count: number; revenue: number }>;
    topCombinations: Array<{ size: string; color: string; count: number; revenue: number }>;
  };
}

/**
 * Получить бизнес-метрики для админки.
 *
 * GET /api/admin/business-metrics?period=7d|30d|90d
 */
export async function fetchBusinessMetrics(
  period: DTO.AdminDashboardPeriodDto = "30d",
): Promise<BusinessMetricsResponse> {
  try {
    const { data } = await axiosInstance.get<BusinessMetricsResponse>(
      ApiRoutes.ADMIN_BUSINESS_METRICS,
      {
        params: { period },
      },
    );

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить бизнес-метрики"),
    );
  }
}
