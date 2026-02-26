/**
 * Хук для расчёта стоимости доставки СДЭК и Почты России в реальном времени.
 */

import type { CheckoutDeliveryMethod } from "@/shared/services/dto";
import { useQuery } from "@tanstack/react-query";

export interface DeliveryCostResult {
  deliveryCostKopecks: number | null;
  periodMin: number | null;
  periodMax: number | null;
  tariffName?: string;
}

const CALCULABLE_METHODS: CheckoutDeliveryMethod[] = [
  "CDEK_PVZ",
  "CDEK_COURIER",
  "POCHTA_PVZ",
  "POCHTA_COURIER",
];

function isCalculableMethod(
  method: CheckoutDeliveryMethod,
): method is "CDEK_PVZ" | "CDEK_COURIER" | "POCHTA_PVZ" | "POCHTA_COURIER" {
  return CALCULABLE_METHODS.includes(method);
}

async function fetchDeliveryCost(
  city: string,
  method: "CDEK_PVZ" | "CDEK_COURIER" | "POCHTA_PVZ" | "POCHTA_COURIER",
  valuationRub?: number,
): Promise<DeliveryCostResult> {
  const params = new URLSearchParams({ city, method });
  if (valuationRub != null && valuationRub > 0) {
    params.set("valuationRub", String(valuationRub));
  }
  const response = await fetch(`/api/shipping/calculate-delivery?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to calculate delivery cost");
  }

  return response.json();
}

interface UseDeliveryCostOptions {
  city: string;
  deliveryMethod: CheckoutDeliveryMethod;
  /** Объявленная ценность в рублях (для Почты России; опционально). */
  valuationRub?: number;
}

export function useDeliveryCost({
  city,
  deliveryMethod,
  valuationRub,
}: UseDeliveryCostOptions) {
  const isCalculable = isCalculableMethod(deliveryMethod);
  const enabled = isCalculable && city.trim().length >= 2;

  return useQuery({
    queryKey: ["delivery-cost", city, deliveryMethod, valuationRub],
    queryFn: () =>
      fetchDeliveryCost(
        city,
        deliveryMethod as "CDEK_PVZ" | "CDEK_COURIER" | "POCHTA_PVZ" | "POCHTA_COURIER",
        valuationRub,
      ),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
