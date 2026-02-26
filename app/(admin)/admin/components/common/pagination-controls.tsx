"use client";

import { Button } from "@/shared/components/ui";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/**
 * Общий компонент пагинации с кнопками "Предыдущая" и "Следующая".
 */
export function PaginationControls(props: PaginationControlsProps) {
  const { currentPage, totalPages, onPageChange, className } = props;

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-2 ${className ?? ""}`}>
      <div className="text-xs text-muted-foreground">
        Страница {currentPage} из {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Предыдущая
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Следующая →
        </Button>
      </div>
    </div>
  );
}



