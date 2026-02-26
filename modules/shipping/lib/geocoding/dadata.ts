/**
 * Сервис для автокомплита городов и стран через DaData
 */

import type { CitySuggestion, CountrySuggestion } from "./types";
import { fetchWithTimeout } from "@/shared/lib/fetch-with-timeout";

/**
 * Получает подсказки для городов
 */
export async function getCitySuggestions(query: string): Promise<CitySuggestion[]> {
  try {
    const apiKey = process.env.DADATA_TOKEN;

    if (!apiKey) {
      return [];
    }

    const response = await fetchWithTimeout(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          count: 10,
          locations: [{ country: "*" }],
          restrict_value: true,
          from_bound: { value: "city" },
          to_bound: { value: "city" },
        }),
      },
      10000, // 10 секунд для подсказок по городам
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      suggestions: Array<{
        value: string;
        data: {
          city: string;
          region: string;
          country: string;
          geo_lat?: number;
          geo_lon?: number;
        };
      }>;
    };

    return data.suggestions.map((s) => ({
      value: s.value,
      city: s.data.city,
      region: s.data.region,
      country: s.data.country,
      lat: s.data.geo_lat,
      lon: s.data.geo_lon,
    }));
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[DaData] City suggestions error", error, { query });
    return [];
  }
}

/**
 * Получает подсказки для стран
 */
export async function getCountrySuggestions(query: string): Promise<CountrySuggestion[]> {
  try {
    const apiKey = process.env.DADATA_TOKEN;

    if (!apiKey) {
      return [];
    }

    const response = await fetchWithTimeout(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          count: 10,
        }),
      },
      10000, // 10 секунд для подсказок по странам
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      suggestions: Array<{
        value: string;
        data: {
          country: string;
          code: string;
        };
      }>;
    };

    return data.suggestions.map((s) => ({
      value: s.value,
      code: s.data.code,
    }));
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[DaData] Country suggestions error", error, { query });
    return [];
  }
}
