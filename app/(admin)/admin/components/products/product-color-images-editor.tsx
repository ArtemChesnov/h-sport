"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { IconCloud } from "@tabler/icons-react";
import { X, Star } from "lucide-react";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Label,
  Badge,
} from "@/shared/components/ui";
import { getCsrfToken } from "@/shared/lib/csrf-client";

type ColorImagesEditorProps = {
  color: string;
  imageUrls: string[];
  onChange: (next: string[]) => void;

  productName: string;
  sku?: string;
};

export function ColorImagesEditor({
  color,
  imageUrls,
  onChange,
  productName,
  sku,
}: ColorImagesEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      Array.from(fileList).forEach((file) => {
        formData.append("files", file);
      });

      formData.append("folder", "products");
      formData.append("productName", productName);
      formData.append("color", color);
      if (sku) formData.append("sku", sku);

      const csrfToken = getCsrfToken();
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message || "Ошибка загрузки файлов");
      }

      const data = (await res.json()) as { paths: string[] };
      onChange([...imageUrls, ...data.paths]);
    } catch (e) {
      // Логируем ошибку на клиенте (logger работает только на сервере)
      // В production ошибки должны отправляться на сервер для логирования
      if (process.env.NODE_ENV === "development") {
        // Используем console только в development, в production отправляем на сервер
        console.error("[ColorImagesEditor] upload error:", e);
      } else {
        // В production можно отправить ошибку на endpoint для логирования
        fetch("/api/errors/client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: e instanceof Error ? e.message : "Upload error",
            stack: e instanceof Error ? e.stack : undefined,
            component: "ColorImagesEditor",
          }),
        }).catch(() => {
          // Игнорируем ошибки отправки
        });
      }
      setError(e instanceof Error ? e.message : "Не удалось загрузить файлы");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove(index: number) {
    onChange(imageUrls.filter((_, i) => i !== index));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setHoverIndex(null);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && dragIndex !== index) {
      setHoverIndex(index);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (
      listRef.current &&
      event.relatedTarget instanceof Node &&
      listRef.current.contains(event.relatedTarget)
    ) {
      return;
    }
    setHoverIndex(null);
  }

  function handleDrop(targetIndex: number, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setHoverIndex(null);
      return;
    }

    const next = [...imageUrls];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);

    onChange(next);
    setDragIndex(null);
    setHoverIndex(null);
  }

  const inputId = `color-images-${color}`;

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">
        Фотографии для цвета «{color}»
      </Label>

      <Empty className="border border-dashed border-border/50">
        <EmptyHeader className="pb-3">
          <EmptyTitle className="text-sm font-semibold">Галерея</EmptyTitle>
          <EmptyDescription className="text-xs text-muted-foreground">
            Первая фотография используется как обложка. Порядок можно менять перетаскиванием.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="space-y-4">
          {imageUrls.length > 0 ? (
            <div ref={listRef} className="flex flex-wrap gap-3">
              {imageUrls.map((url, index) => {
                const isCover = index === 0;
                const isDragging = dragIndex === index;
                const isHovered = hoverIndex === index && dragIndex !== null && dragIndex !== index;

                return (
                  <div
                    key={url}
                    className={`group relative cursor-move transition-all duration-150 ${
                      isDragging ? "opacity-40" : ""
                    } ${isHovered ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(index);
                      e.dataTransfer.effectAllowed = "move";
                      if (e.dataTransfer) {
                        e.dataTransfer.setData("text/html", "");
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(index, e)}
                  >
                    <div
                      className={`relative overflow-hidden rounded-lg border transition-colors ${
                        isCover
                          ? "h-40 w-40 border-foreground/30 shadow-md"
                          : "h-32 w-32 border-border hover:border-foreground/20 hover:shadow-sm"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Фото ${index + 1} для цвета ${color}`}
                        fill
                        className="object-cover pointer-events-none select-none"
                        sizes={isCover ? "160px" : "128px"}
                        draggable={false}
                      />

                      {isCover && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2 h-5 bg-background/95 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 border-foreground/30 shadow-sm z-10 pointer-events-none"
                        >
                          <Star className="h-2.5 w-2.5 mr-1 fill-current text-foreground" />
                          Обложка
                        </Badge>
                      )}

                      {!isCover && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2 h-5 bg-background/95 backdrop-blur-sm text-[10px] font-medium px-2 py-0.5 border-border/50 shadow-sm pointer-events-none"
                        >
                          {index + 1}
                        </Badge>
                      )}

                      {isHovered && (
                        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-10 pointer-events-none">
                          <span className="text-xs font-medium text-primary bg-background/95 px-2 py-1 rounded shadow-sm">
                            Сюда
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="absolute -right-1.5 -top-1.5 z-20 inline-flex h-5 w-5 items-center justify-center rounded-full border border-background bg-destructive text-white shadow-md transition-all hover:bg-destructive/90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      aria-label="Удалить фото"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Нет фотографий. Первая загруженная станет обложкой.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(inputId)?.click()}
              disabled={isUploading}
              className="h-9 cursor-pointer"
            >
              <IconCloud className="mr-2 h-4 w-4" />
              {isUploading ? "Загрузка..." : "Выбрать файлы"}
            </Button>

            <span className="text-xs text-muted-foreground">Можно выбрать несколько файлов</span>
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </EmptyContent>
      </Empty>

      <input
        id={inputId}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFilesSelected(e.target.files)}
      />
    </div>
  );
}
