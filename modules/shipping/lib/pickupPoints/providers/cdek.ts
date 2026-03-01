/**
 * Провайдер для работы с API СДЕК
 */

import { env } from "@/shared/lib/config/env";
import { fetchWithTimeout } from "@/shared/lib/fetch-with-timeout";
import type { PickupPoint } from "../../../types/pickup-points";

// delivery_mode в ответе tarifflist:
// 1 = дверь → дверь, 2 = дверь → склад, 3 = склад → дверь, 4 = склад → склад
const DELIVERY_MODE_PVZ = 4; // склад → склад (ПВЗ)
const DELIVERY_MODE_COURIER = 3; // склад → дверь (курьер)

export interface CDEKTariffResult {
  deliverySum: number;
  periodMin: number;
  periodMax: number;
  tariffCode: number;
  tariffName: string;
  currency: string;
}

interface CDEKTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CDEKCity {
  code: number;
  city: string;
  region: string;
}

interface CDEKDeliveryPoint {
  code: string;
  name: string;
  location: {
    address: string;
    city: string;
    postal_code?: string;
    latitude: number;
    longitude: number;
  };
  work_time?: string;
  phones?: Array<{ number: string }>;
  type: "PVZ" | "POSTAMAT";
}

let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

/**
 * Получает OAuth токен для API СДЕК
 */
async function getCDEKToken(): Promise<string> {
  const clientId = env.CDEK_CLIENT_ID;
  const clientSecret = env.CDEK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorMsg =
      "CDEK credentials not configured. Для работы СДЕК ПВЗ необходим договор с компанией СДЕК и API ключи. Обратитесь к администратору или заказчику для получения ключей.";
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[CDEK] Credentials not configured", new Error(errorMsg));
    throw new Error(errorMsg);
  }

  // Проверяем кеш
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const isTest = env.CDEK_IS_TEST ?? false;

  const response = await fetchWithTimeout(
    `https://${isTest ? "api.edu" : "api"}.cdek.ru/v2/oauth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    },
    10000 // 10 секунд для OAuth
  );

  if (!response.ok) {
    throw new Error(`CDEK auth failed: ${response.statusText}`);
  }

  const data = (await response.json()) as CDEKTokenResponse;

  // Кешируем токен (с запасом 5 минут)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return tokenCache.token;
}

/**
 * Нормализует название города для сравнения (нижний регистр, без лишних пробелов)
 */
function normalizeCityName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Ищет город по названию. Запрашивает несколько вариантов и подбирает совпадение по имени.
 */
export async function findCDEKCity(cityName: string): Promise<string | null> {
  try {
    const token = await getCDEKToken();
    const isTest = env.CDEK_IS_TEST ?? false;

    const response = await fetchWithTimeout(
      `https://${isTest ? "api.edu" : "api"}.cdek.ru/v2/location/cities?city=${encodeURIComponent(cityName)}&size=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      10000
    );

    if (!response.ok) {
      return null;
    }

    const raw = await response.json();
    const items: CDEKCity[] = Array.isArray(raw) ? raw : raw.items || [];
    if (items.length === 0) return null;

    const normalized = normalizeCityName(cityName);

    // Точное совпадение
    const exact = items.find((c) => normalizeCityName(c.city) === normalized);
    if (exact) return String(exact.code);

    // Город в ответе содержит введённое название или наоборот
    const partial = items.find(
      (c) =>
        normalizeCityName(c.city).includes(normalized) ||
        normalized.includes(normalizeCityName(c.city))
    );
    if (partial) return String(partial.code);

    return String(items[0].code);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[CDEK] City search error", error, { cityName });
    return null;
  }
}

function mapDeliveryPointsToPickup(items: CDEKDeliveryPoint[]): PickupPoint[] {
  return items.map((point) => ({
    id: `cdek-${point.code}`,
    provider: "cdek" as const,
    type: point.type === "PVZ" ? "PVZ" : "POSTAMAT",
    name: point.name,
    address: point.location.address,
    city: point.location.city,
    postalCode: point.location.postal_code,
    lat: point.location.latitude,
    lon: point.location.longitude,
    workTime: point.work_time,
    phone: point.phones?.[0]?.number,
  }));
}

/**
 * Запрашивает ПВЗ по URL и возвращает массив пунктов
 */
async function fetchDeliveryPoints(token: string, url: string): Promise<CDEKDeliveryPoint[]> {
  const response = await fetchWithTimeout(
    url,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
    10000
  );
  if (!response.ok) {
    throw new Error(`CDEK API error: ${response.statusText}`);
  }
  const raw = await response.json();
  return Array.isArray(raw) ? raw : raw.items || [];
}

/**
 * Получает список пунктов выдачи СДЕК.
 * В тестовом API (api.edu.cdek.ru) при пустом ответе по городу делается fallback: запрос по country_code=RU и фильтрация по названию города.
 */
export async function getCDEKPickupPoints(
  cityCode?: string,
  city?: string,
  lat?: number,
  lon?: number,
  limit: number = 50
): Promise<PickupPoint[]> {
  try {
    const token = await getCDEKToken();
    const isTest = env.CDEK_IS_TEST ?? false;
    const baseUrl = `https://${isTest ? "api.edu" : "api"}.cdek.ru/v2/deliverypoints`;

    let url: string;

    if (cityCode) {
      url = `${baseUrl}?size=${limit}&city_code=${cityCode}`;
    } else if (city) {
      const code = await findCDEKCity(city);
      if (code) {
        url = `${baseUrl}?size=${limit}&city_code=${code}`;
      } else {
        if (isTest) {
          // Тестовый API: запрашиваем пункты по стране и фильтруем по городу
          const allUrl = `${baseUrl}?size=300&country_code=RU`;
          const items = await fetchDeliveryPoints(token, allUrl);
          const normalized = normalizeCityName(city);
          const filtered = items.filter((p) => {
            const pointCity = normalizeCityName(p.location.city);
            return (
              pointCity === normalized ||
              pointCity.includes(normalized) ||
              normalized.includes(pointCity)
            );
          });
          return mapDeliveryPointsToPickup(filtered.slice(0, limit));
        }
        const { logger } = await import("@/shared/lib/logger");
        logger.warn(`[CDEK] City "${city}" not found in CDEK database`, { city });
        return [];
      }
    } else if (lat != null && lon != null) {
      url = `${baseUrl}?size=${limit}&latitude=${lat}&longitude=${lon}`;
    } else {
      return [];
    }

    const items = await fetchDeliveryPoints(token, url);

    if (items.length === 0 && isTest && city) {
      // Fallback для тестового API: без city_code по стране, затем фильтр по городу
      const allUrl = `${baseUrl}?size=300&country_code=RU`;
      const allItems = await fetchDeliveryPoints(token, allUrl);
      const normalized = normalizeCityName(city);
      const filtered = allItems.filter((p) => {
        const pointCity = normalizeCityName(p.location.city);
        return (
          pointCity === normalized ||
          pointCity.includes(normalized) ||
          normalized.includes(pointCity)
        );
      });
      return mapDeliveryPointsToPickup(filtered.slice(0, limit));
    }

    if (items.length === 0) {
      const { logger } = await import("@/shared/lib/logger");
      logger.warn(`[CDEK] No pickup points found`, { city, cityCode });
      return [];
    }

    return mapDeliveryPointsToPickup(items);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[CDEK] Pickup points error", error, { city, cityCode, lat, lon });
    throw error;
  }
}

/**
 * Рассчитывает стоимость доставки СДЭК.
 *
 * Использует POST /v2/calculator/tarifflist для получения всех доступных тарифов,
 * затем выбирает самый дешёвый с подходящим delivery_mode.
 *
 * @param toCityName  — город получателя
 * @param mode        — "pvz" (склад→склад) или "courier" (склад→дверь)
 * @param weightGrams — общий вес посылки в граммах (по умолчанию 1000 г)
 */
export async function calculateCDEKTariff(
  toCityName: string,
  mode: "pvz" | "courier",
  weightGrams: number = 1000
): Promise<CDEKTariffResult | null> {
  try {
    const token = await getCDEKToken();
    const isTest = env.CDEK_IS_TEST ?? false;
    const baseUrl = `https://${isTest ? "api.edu" : "api"}.cdek.ru`;

    const fromCityCode = env.CDEK_FROM_CITY_CODE ?? "137";
    const toCityCode = await findCDEKCity(toCityName);
    if (!toCityCode) return null;

    const body = {
      type: 2,
      currency: 1,
      lang: "rus",
      from_location: { code: Number(fromCityCode) },
      to_location: { code: Number(toCityCode) },
      packages: [
        {
          weight: weightGrams,
          height: 10,
          width: 20,
          length: 30,
        },
      ],
    };

    const response = await fetchWithTimeout(
      `${baseUrl}/v2/calculator/tarifflist`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      10000
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      const { logger } = await import("@/shared/lib/logger");
      logger.warn("[CDEK] Tarifflist request failed", {
        status: response.status,
        body: errBody.slice(0, 500),
        toCityName,
        mode,
      });
      return null;
    }

    const data = await response.json();
    const tariffs: Array<{
      tariff_code: number;
      tariff_name: string;
      delivery_mode: number;
      delivery_sum: number;
      period_min: number;
      period_max: number;
      currency?: string;
    }> = data.tariff_codes || [];

    const targetMode = mode === "pvz" ? DELIVERY_MODE_PVZ : DELIVERY_MODE_COURIER;
    const matching = tariffs.filter((t) => t.delivery_mode === targetMode);
    if (matching.length === 0) return null;

    const cheapest = matching.reduce((a, b) => (a.delivery_sum <= b.delivery_sum ? a : b));

    return {
      deliverySum: Math.round(cheapest.delivery_sum * 100),
      periodMin: cheapest.period_min ?? 0,
      periodMax: cheapest.period_max ?? 0,
      tariffCode: cheapest.tariff_code,
      tariffName: cheapest.tariff_name,
      currency: cheapest.currency ?? "RUB",
    };
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[CDEK] Tariff calculation error", error, { toCityName, mode });
    return null;
  }
}
