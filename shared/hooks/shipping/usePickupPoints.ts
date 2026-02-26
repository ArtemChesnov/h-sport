/**
 * Хук для получения пунктов выдачи
 */

import { useQuery } from "@tanstack/react-query";
import type { PickupPoint, PickupProvider } from "@/modules/shipping/types/pickup-points";

interface UsePickupPointsOptions {
  provider: PickupProvider;
  city?: string;
  cityCode?: string;
  q?: string;
  lat?: number;
  lon?: number;
  limit?: number;
  enabled?: boolean;
}

async function fetchPickupPoints(options: UsePickupPointsOptions): Promise<PickupPoint[]> {
  const params = new URLSearchParams();
  params.set("provider", options.provider);

  if (options.city) params.set("city", options.city);
  if (options.cityCode) params.set("cityCode", options.cityCode);
  if (options.q) params.set("q", options.q);
  if (options.lat !== undefined) params.set("lat", options.lat.toString());
  if (options.lon !== undefined) params.set("lon", options.lon.toString());
  if (options.limit) params.set("limit", options.limit.toString());

  const response = await fetch(`/api/shipping/pickup-points?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || "Failed to fetch pickup points";
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.points || [];
}

export function usePickupPointsQuery(options: UsePickupPointsOptions) {
  return useQuery({
    queryKey: ["pickup-points", options],
    queryFn: () => fetchPickupPoints(options),
    enabled: options.enabled !== false && (!!options.city || !!options.cityCode || (options.lat !== undefined && options.lon !== undefined)),
    staleTime: 12 * 60 * 60 * 1000, // 12 часов
  });
}
