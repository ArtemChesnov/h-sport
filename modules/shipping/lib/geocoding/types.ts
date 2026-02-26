/**
 * Типы для геокодинга и автокомплита
 */

export interface CitySuggestion {
  value: string;
  city: string;
  region: string;
  country: string;
  lat?: number;
  lon?: number;
}

export interface CountrySuggestion {
  value: string;
  code: string;
}
