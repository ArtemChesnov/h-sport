/**
 * Провайдер для работы с API Почты России через DaData (ПВЗ) и Postcalc.RU (тарифы).
 */

import { fetchWithTimeout } from "@/shared/lib/fetch-with-timeout";
import { gunzipSync } from "node:zlib";
import type { PickupPoint } from "../../../types/pickup-points";

/** Результат расчёта тарифа Почты России (Postcalc.RU). */
export interface RussianPostTariffResult {
  deliverySum: number;
  periodMin: number;
  periodMax: number;
  tariffCode: string;
  tariffName: string;
  currency: string;
}

interface DaDataPostalUnit {
  value: string;
  unrestricted_value: string;
  data: {
    postal_code: string;
    address_str: string;
    geo_lat?: number;
    geo_lon?: number;
    schedule_mon?: string;
    schedule_tue?: string;
    schedule_wed?: string;
    schedule_thu?: string;
    schedule_fri?: string;
    schedule_sat?: string;
    schedule_sun?: string;
    is_closed?: boolean;
    type_code?: string;
  };
}


/**
 * Получает список отделений Почты России
 */
export async function getRussianPostPickupPoints(
  city: string,
  q?: string,
  limit: number = 50,
): Promise<PickupPoint[]> {
  try {
    const apiKey = process.env.DADATA_TOKEN;

    if (!apiKey) {
      const { logger } = await import("@/shared/lib/logger");
      logger.error("[RussianPost] DaData token not configured. Please set DADATA_TOKEN in .env file. See API_SETUP.md for instructions.");
      return [];
    }

    const query = q || city;

    const response = await fetchWithTimeout(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/postal_unit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          count: limit,
          // Всегда фильтруем по городу, если он указан
          locations: city ? [{ city }] : undefined,
        }),
      },
      10000, // 10 секунд для получения отделений Почты России
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const { logger } = await import("@/shared/lib/logger");
      logger.error(`[RussianPost] DaData API error: ${response.status}`, new Error(errorText), { city, query: q });
      throw new Error(`DaData API returned ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { suggestions: DaDataPostalUnit[] };

    if (!data.suggestions || data.suggestions.length === 0) {
      const { logger } = await import("@/shared/lib/logger");
      logger.warn(`[RussianPost] No postal units found for city "${city}"`, { city, query: q });
      return [];
    }

    // Фильтруем результаты по городу на случай, если API вернул результаты из других городов
    const filteredSuggestions = city
      ? data.suggestions.filter((suggestion) => {
          const fullAddress = suggestion.data.address_str || suggestion.unrestricted_value || "";
          const addressCity = fullAddress.split(",")[0]?.replace(/^г\s+/i, "").trim() || "";

          // Нормализуем названия городов для сравнения (убираем регистр)
          const normalizedCity = city.toLowerCase().trim();
          const normalizedAddressCity = addressCity.toLowerCase().trim();

          // Проверяем совпадение города
          return normalizedAddressCity === normalizedCity ||
                 normalizedAddressCity.includes(normalizedCity) ||
                 normalizedCity.includes(normalizedAddressCity);
        })
      : data.suggestions;

    return filteredSuggestions.map((suggestion, index) => {
      const d = suggestion.data;

      // Используем address_str из API, который содержит полный адрес
      // Формат должен быть: Участок {postal_code} {city}, , {street} ул, {house}
      // Пример: Участок 101760 Москва, , Перовская ул, 68

      // address_str содержит адрес типа "г Москва, Перовская ул, д 68" или подобный
      const fullAddress = d.address_str || suggestion.unrestricted_value || "";

      // Парсим адрес для извлечения компонентов
      let cityName = "";
      let street = "";
      let house = "";

      if (fullAddress) {
        // Разбиваем адрес по запятым
        const parts = fullAddress.split(",").map(p => p.trim()).filter(Boolean);

        // Первая часть обычно город (убираем "г " префикс)
        if (parts.length > 0) {
          cityName = parts[0].replace(/^г\s+/i, "").trim();
        }

        // Вторая часть обычно улица
        if (parts.length > 1) {
          street = parts[1].trim();
          // Убираем "ул " префикс если есть, добавляем " ул" в конец если нет
          street = street.replace(/^ул\.?\s*/i, "").trim();
          if (street && !street.toLowerCase().endsWith(" ул") && !street.toLowerCase().endsWith(" улица")) {
            street = `${street} ул`;
          }
        }

        // Третья часть обычно дом
        if (parts.length > 2) {
          house = parts[2].replace(/^д\s*/i, "").trim();
        }
      }

      // Если город не найден, используем переданный город как fallback
      if (!cityName && city) {
        cityName = city;
      }

      // Формируем адрес в требуемом формате
      // Формат: Участок {индекс} {город}, {улица} ул, {дом}
      let formattedAddress = `Участок ${d.postal_code}`;

      if (cityName) {
        formattedAddress += ` ${cityName}`;
      }

      if (street) {
        formattedAddress += `, ${street}`;
      }

      if (house) {
        formattedAddress += `, ${house}`;
      }

      // Очищаем от лишних пробелов
      formattedAddress = formattedAddress.replace(/\s+/g, " ").trim();

      // Формируем расписание работы из отдельных дней
      const scheduleParts: string[] = [];
      if (d.schedule_mon) scheduleParts.push(`Пн: ${d.schedule_mon}`);
      if (d.schedule_tue) scheduleParts.push(`Вт: ${d.schedule_tue}`);
      if (d.schedule_wed) scheduleParts.push(`Ср: ${d.schedule_wed}`);
      if (d.schedule_thu) scheduleParts.push(`Чт: ${d.schedule_thu}`);
      if (d.schedule_fri) scheduleParts.push(`Пт: ${d.schedule_fri}`);
      if (d.schedule_sat) scheduleParts.push(`Сб: ${d.schedule_sat}`);
      if (d.schedule_sun) scheduleParts.push(`Вс: ${d.schedule_sun}`);
      const workTime = scheduleParts.length > 0 ? scheduleParts.join(", ") : undefined;

      return {
        id: `russianpost-${d.postal_code}-${index}`,
        provider: "russianpost" as const,
        type: "POST_OFFICE" as const,
        name: `Отделение почтовой связи ${d.postal_code}`,
        address: formattedAddress,
        city: cityName,
        postalCode: d.postal_code,
        lat: d.geo_lat,
        lon: d.geo_lon,
        workTime,
        phone: undefined, // API не возвращает телефон
      };
    });
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[RussianPost] Pickup points error", error, { city, query: q });
    throw error;
  }
}

/** Коды отправлений Postcalc.RU: pv = ценная посылка (ПВЗ), em = EMS курьер. */
const POSTCALC_PARCEL_PVZ = "pv";
const POSTCALC_PARCEL_COURIER = "em";

/** Нормализует город для Postcalc: пробелы → подчёркивания. */
function postcalcCityKey(city: string): string {
  return city.trim().replace(/\s+/g, "_");
}

/**
 * Рассчитывает стоимость доставки Почты России через Postcalc.RU API.
 * Для физлиц (co=0). Требуется ключ key=test (50 запросов/день) или POSTCALC_KEY в .env.
 *
 * @param toCityName   — город получателя
 * @param mode         — "pvz" (посылка в отделение) или "courier" (EMS до двери)
 * @param weightGrams  — вес в граммах (по умолчанию 1000)
 * @param valuationRub — объявленная ценность в рублях (для страховки; по умолчанию 1000)
 */
export async function calculateRussianPostTariff(
  toCityName: string,
  mode: "pvz" | "courier",
  weightGrams: number = 1000,
  valuationRub: number = 1000,
): Promise<RussianPostTariffResult | null> {
  try {
    const fromKey = (process.env.POSTCALC_FROM_CITY || "Нижний_Новгород").trim().replace(/\s+/g, "_");
    const toKey = postcalcCityKey(toCityName);
    const parcelCode = mode === "pvz" ? POSTCALC_PARCEL_PVZ : POSTCALC_PARCEL_COURIER;
    const key = process.env.POSTCALC_KEY || "test";

    const params = new URLSearchParams({
      f: fromKey,
      t: toKey,
      w: String(Math.min(31500, Math.max(1, weightGrams))),
      v: String(Math.max(1, Math.min(100_000, Math.round(valuationRub)))),
      p: parcelCode,
      key,
      o: "json",
      co: "0",
    });

    const url = `http://api2.postcalc.ru/?${params.toString()}`;
    const response = await fetchWithTimeout(url, { method: "GET" }, 10000);

    if (!response.ok) {
      const { logger } = await import("@/shared/lib/logger");
      logger.warn("[RussianPost] Postcalc API error", {
        status: response.status,
        toCityName,
        mode,
      });
      return null;
    }

    const rawBuffer = Buffer.from(await response.arrayBuffer());
    const isGzip =
      rawBuffer.length >= 3 && rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b && rawBuffer[2] === 0x08;
    const jsonText = isGzip
      ? gunzipSync(rawBuffer).toString("utf-8")
      : new TextDecoder().decode(rawBuffer);
    type ShipmentEntry = {
      Доставка?: number; Тариф?: number; СрокДоставки?: string; Название?: string;
      Total?: number; Rate?: number; DeliveryTerms?: string; Title?: string;
    };
    const data = JSON.parse(jsonText) as {
      Отправления?: Record<string, ShipmentEntry>;
      Shipments?: Record<string, ShipmentEntry>;
    };

    const shipments = data.Отправления ?? data.Shipments ?? {};
    const codeRu = mode === "pvz" ? "ЦеннаяПосылка" : "EMS";
    const codeEn = mode === "pvz" ? "ParcelValuable" : "EMS";
    const shipment = shipments[codeRu] ?? shipments[codeEn];
    if (!shipment) return null;

    const totalRub = shipment.Доставка ?? shipment.Total ?? shipment.Тариф ?? shipment.Rate ?? 0;
    if (totalRub <= 0) return null;

    const termsStr = shipment.СрокДоставки ?? shipment.DeliveryTerms ?? "";
    let periodMin = 0;
    let periodMax = 0;
    if (termsStr) {
      const parts = termsStr.replace(/\s+/g, "").split("-");
      periodMin = parseInt(parts[0], 10) || 0;
      periodMax = parseInt(parts[1], 10) || periodMin;
    }

    return {
      deliverySum: Math.round(totalRub * 100),
      periodMin,
      periodMax,
      tariffCode: parcelCode,
      tariffName: shipment.Название ?? shipment.Title ?? (mode === "pvz" ? "Ценная посылка" : "EMS"),
      currency: "RUB",
    };
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("[RussianPost] Tariff calculation error", error, { toCityName, mode });
    return null;
  }
}
