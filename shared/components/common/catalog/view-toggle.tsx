"use client";

import React from "react";
import { LayoutGrid, Columns } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

export type ViewMode = "mosaic" | "grid-2";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
};

export function ViewToggle({ viewMode, onViewModeChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        onClick={() => onViewModeChange("mosaic")}
        className={cn(
          "self-start",
          viewMode === "mosaic" && "bg-accent text-accent-foreground"
        )}
        title="Мозаичный вид"
      >
        <LayoutGrid className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => onViewModeChange("grid-2")}
        className={cn(
          "self-start",
          viewMode === "grid-2" && "bg-accent text-accent-foreground"
        )}
        title="Сетка 2 колонки"
      >
        <Columns className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden="true" />
      </Button>
    </div>
  );
}
