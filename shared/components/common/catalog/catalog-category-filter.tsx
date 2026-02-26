/**
 * Компонент фильтра по категориям
 */

import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type CatalogCategoryFilterProps = {
  categories: Array<{ id: number; name: string; slug: string }>;
  selectedCategories: string[];
  onToggle: (slug: string) => void;
  isLoading?: boolean;
};

export function CatalogCategoryFilter({
  categories,
  selectedCategories,
  onToggle,
  isLoading,
}: CatalogCategoryFilterProps) {
  const [showAll, setShowAll] = React.useState(false);

  const displayedCategories = React.useMemo(() => {
    if (categories.length === 0) return [];
    return showAll ? categories : categories.slice(0, 5);
  }, [categories, showAll]);

  return (
    <div className="">
      {isLoading ? (
        <div className="h-[33px] w-32 bg-accent animate-pulse rounded mb-6" />
      ) : (
        <h3 className="font-heading text-[22px] font-medium text-[#1f1e1e] mb-6">
          Категории
        </h3>
      )}
      <nav className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <label key={i} className="flex items-center gap-2">
                <div className="w-4 h-5 bg-accent animate-pulse rounded border-2 border-accent" />
                <div className="h-6 w-32 bg-accent animate-pulse rounded" />
              </label>
            ))}
          </div>
        ) : (
          <>
            {displayedCategories.map((category) => {
              const isChecked = selectedCategories.includes(category.slug);
              return (
                <label
                  key={category.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggle(category.slug);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150",
                        isChecked
                          ? "bg-[#EB6081] border-[#EB6081]"
                          : "bg-white border-[#EB6081] group-hover:border-[#d8859d]",
                      )}
                    >
                      {isChecked && (
                        <Check className="h-3 w-3 text-white stroke-[2.5] animate-in fade-in-0 zoom-in-75 duration-150" />
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-base font-light transition-colors duration-150",
                      isChecked
                        ? "text-[#1f1e1e] font-medium"
                        : "text-[#1f1e1e] group-hover:text-[#EB6081]",
                    )}
                  >
                    {category.name}
                  </span>
                </label>
              );
            })}
          </>
        )}
      </nav>
      {isLoading ? (
        <div className="h-6 w-28 bg-accent animate-pulse rounded mt-3" />
      ) : (
        categories.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-base font-light text-[#1f1e1e] hover:text-[#EB6081] transition-colors duration-150 flex items-center gap-1 mt-3 mb-0 cursor-pointer"
          >
            {showAll ? "Скрыть" : "Смотреть всё"}
            {showAll ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-150" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-150" />
            )}
          </button>
        )
      )}
    </div>
  );
}
