"use client";

/**
 * Виртуализированная таблица с использованием @tanstack/react-virtual
 * Используется для отображения больших списков без деградации производительности
 */

import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui";

export interface VirtualizedTableColumn<T> {
  id: string;
  header: React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
  cell: (item: T, index: number) => React.ReactNode;
}

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: VirtualizedTableColumn<T>[];
  rowHeight?: number;
  maxHeight?: number;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  emptyMessage?: string;
  getRowKey: (item: T, index: number) => string | number;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 56,
  maxHeight = 600,
  onRowClick,
  rowClassName,
  emptyMessage = "Нет данных",
  getRowKey,
}: VirtualizedTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // TanStack Virtual: useVirtualizer несовместим с React Compiler (ожидаемо для этой библиотеки)
  // eslint-disable-next-line react-hooks/incompatible-library -- известная несовместимость @tanstack/react-virtual
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (data.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/50 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/40 border-b border-border/50">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                style={{ width: column.width }}
                className={`font-semibold text-xs h-12 align-middle px-4 ${column.headerClassName || ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>

      <div ref={parentRef} style={{ maxHeight, overflow: "auto" }} className="relative">
        <div style={{ height: totalSize, position: "relative" }}>
          <Table>
            <TableBody>
              {virtualRows.map((virtualRow) => {
                const item = data[virtualRow.index];
                const rowKey = getRowKey(item, virtualRow.index);
                const customRowClass = rowClassName?.(item, virtualRow.index) || "";

                return (
                  <TableRow
                    key={rowKey}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`border-b border-border/30 transition-all hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 hover:shadow-sm ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${customRowClass}`}
                    onClick={onRowClick ? () => onRowClick(item, virtualRow.index) : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        style={{ width: column.width }}
                        className={`h-14 align-middle px-4 ${column.className || ""}`}
                      >
                        {column.cell(item, virtualRow.index)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
