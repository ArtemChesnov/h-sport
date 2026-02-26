/**
 * Хук для получения подсказок городов
 */

import { useQuery } from "@tanstack/react-query";
import type { CitySuggestion } from "@/modules/shipping/lib/geocoding/types";
import { useDebouncedValue } from "@/shared/hooks";

async function fetchCitySuggestions(q: string): Promise<CitySuggestion[]> {
  if (!q || q.length < 2) return [];

  const response = await fetch(`/api/shipping/suggestions/city?q=${encodeURIComponent(q)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch city suggestions");
  }
  const data = await response.json();
  return data.suggestions;
}

export function useCitySuggestions(query: string, enabled: boolean = true) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ["city-suggestions", debouncedQuery],
    queryFn: () => fetchCitySuggestions(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
