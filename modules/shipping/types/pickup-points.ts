/**
 * Типы для работы с пунктами выдачи
 */

export type PickupProvider = "cdek" | "russianpost";

export type PickupPointType = "PVZ" | "POST_OFFICE" | "POSTAMAT";

export interface PickupPoint {
  id: string;
  provider: PickupProvider;
  type: PickupPointType;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  lat?: number;
  lon?: number;
  workTime?: string;
  phone?: string;
}

export interface PickupPointsQuery {
  provider: PickupProvider;
  city?: string;
  cityCode?: string;
  q?: string;
  lat?: number;
  lon?: number;
  limit?: number;
}
