import type * as DTO from "@/shared/services/dto";

type SortParam = NonNullable<DTO.ProductsQueryDto["sort"]>;
type AvailabilityFilter = "available" | "unavailable";

export function parseSort(value: string | null): SortParam {
  if (value === "new" || value === "price_asc" || value === "price_desc" || value === "popular") {
    return value;
  }
  return "new";
}

export function parseAvailability(value: string | null): AvailabilityFilter | undefined {
  if (value === "available" || value === "unavailable") return value;
  return undefined;
}
