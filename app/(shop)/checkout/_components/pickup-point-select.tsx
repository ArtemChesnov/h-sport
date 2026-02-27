/**
 * Компонент выбора пункта выдачи
 */

"use client";

import type { PickupPoint, PickupProvider } from "@/modules/shipping/types/pickup-points";
import { ContentLoader } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { INPUT_FIELD_CLASS } from "@/shared/constants";
import { usePickupPointsQuery } from "@/shared/hooks/shipping/usePickupPoints";
import { cn } from "@/shared/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

interface PickupPointSelectProps {
  provider: PickupProvider;
  city: string;
  value?: string;
  onSelect: (point: PickupPoint) => void;
  disabled?: boolean;
}

export function PickupPointSelect({
  provider,
  city,
  value,
  onSelect,
  disabled,
}: PickupPointSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const {
    data: points,
    isLoading,
    error,
  } = usePickupPointsQuery({
    provider,
    city,
    q: searchQuery || undefined,
    limit: 50,
    enabled: !!city && city.length > 0 && !disabled,
  });

  const selectedPoint = points?.find((p) => p.id === value);

  const filteredPoints = React.useMemo(() => {
    if (!points || points.length === 0) return [];

    let filtered = points;

    // Фильтруем по городу, если он указан
    if (city) {
      const normalizedCity = city.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const pointCity = (p.city || "").toLowerCase().trim();
        return (
          pointCity === normalizedCity ||
          pointCity.includes(normalizedCity) ||
          normalizedCity.includes(pointCity)
        );
      });
    }

    // Фильтруем по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [points, searchQuery, city]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !city || city.length === 0}
          className="h-11 w-full justify-between text-[16px] leading-[130%] rounded-[10px] border border-input"
        >
          {selectedPoint
            ? selectedPoint.address || selectedPoint.name
            : city
              ? "Выберите пункт выдачи"
              : "Укажите город для загрузки ПВЗ"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-neutral-300 px-3">
            <input
              type="text"
              placeholder="Поиск пункта выдачи..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(INPUT_FIELD_CLASS, "border-0 bg-transparent focus:ring-0")}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <ContentLoader variant="block" size="sm" className="p-4" />
            ) : error ? (
              <div className="py-4 px-2 text-center text-[14px] text-muted-foreground">
                <div className="font-medium text-destructive">Ошибка загрузки пунктов выдачи</div>
                <div className="mt-1 text-[12px]">
                  {provider === "cdek"
                    ? "Для работы СДЕК ПВЗ нужен договор и API ключи. Обратитесь к администратору."
                    : "Проверьте настройку DADATA_TOKEN в .env файле (см. API_SETUP.md)"}
                </div>
              </div>
            ) : !points || points.length === 0 ? (
              <div className="py-4 px-2 text-center text-[14px] text-muted-foreground">
                <div>Пункты выдачи не найдены для города &quot;{city}&quot;</div>
                <div className="mt-1 text-[12px]">
                  {provider === "cdek"
                    ? "Для работы СДЕК нужен договор и API ключи"
                    : "Проверьте название города или убедитесь, что DADATA_TOKEN настроен"}
                </div>
              </div>
            ) : filteredPoints.length === 0 ? (
              <div className="py-4 text-center text-[14px] text-muted-foreground">
                По запросу &quot;{searchQuery}&quot; ничего не найдено
              </div>
            ) : (
              <div className="p-1">
                {filteredPoints.map((point) => (
                  <div
                    key={point.id}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onSelect(point);
                      setOpen(false);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{point.name}</div>
                      <div className="text-muted-foreground">{point.address}</div>
                      {point.workTime && (
                        <div className="text-muted-foreground text-[12px]">🕒 {point.workTime}</div>
                      )}
                      {point.phone && (
                        <div className="text-muted-foreground text-[12px]">📞 {point.phone}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
