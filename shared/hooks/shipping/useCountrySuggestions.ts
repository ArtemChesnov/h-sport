/**
 * Хук для получения подсказок стран
 */

import { useQuery } from "@tanstack/react-query";
import type { CountrySuggestion } from "@/modules/shipping/lib/geocoding/types";
import { useDebouncedValue } from "@/shared/hooks";

async function fetchCountrySuggestions(q: string): Promise<CountrySuggestion[]> {
  if (!q || q.length < 2) return [];

  const response = await fetch(`/api/shipping/suggestions/country?q=${encodeURIComponent(q)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch country suggestions");
  }
  const data = await response.json();
  return data.suggestions;
}

export function useCountrySuggestions(query: string, enabled: boolean = true) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ["country-suggestions", debouncedQuery],
    queryFn: () => fetchCountrySuggestions(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
