"use client";

import { cn } from "@/shared/lib";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ProductGalleryNewProps {
  images: string[];
  activeImage: string | null;
  onImageSelect: (image: string) => void;
  className?: string;
}

const THUMBNAIL_GAP = 20;
const THUMBNAIL_GAP_MOBILE = 12;
const MAX_VISIBLE_THUMBNAILS = 3;

/**
 * Новая галерея изображений товара
 * Миниатюры слева с кнопками скролла, главное изображение справа с навигацией
 */
export function ProductGalleryNew({
  images,
  activeImage,
  onImageSelect,
  className,
}: ProductGalleryNewProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [thumbnailsHovered, setThumbnailsHovered] = useState(false);
  const [mobileThumbnailsHovered, setMobileThumbnailsHovered] = useState(false);
  const [mainImageHovered, setMainImageHovered] = useState(false);

  // Десктоп скролл (вертикальный)
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Мобайл скролл (горизонтальный)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const mobileThumbnailsRef = useRef<HTMLDivElement>(null);

  // Обновление состояния вертикального скролла (десктоп)
  const updateScrollState = useCallback(() => {
    const el = thumbnailsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 1);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
  }, []);

  // Обновление состояния горизонтального скролла (мобайл)
  const updateMobileScrollState = useCallback(() => {
    const el = mobileThumbnailsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const handleImageLoad = (src: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [src]: false }));
  };

  const handleImageLoadStart = (src: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [src]: true }));
  };

  const currentImage = activeImage || images[0];
  const currentIndex = images.indexOf(currentImage);
  const canScrollThumbnails = images.length > MAX_VISIBLE_THUMBNAILS;

  // Автоскролл к активной миниатюре при смене изображения
  useEffect(() => {
    const container = thumbnailsRef.current;
    const firstChild = container?.querySelector("[data-thumbnail]");
    if (!container || !firstChild || currentIndex < 0) return;

    const thumbRect = firstChild.getBoundingClientRect();
    const itemHeight = thumbRect.height + THUMBNAIL_GAP;
    const itemTop = currentIndex * itemHeight;
    const itemBottom = itemTop + thumbRect.height;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    if (itemTop < containerScrollTop) {
      container.scrollTo({ top: itemTop, behavior: "smooth" });
    } else if (itemBottom > containerScrollTop + containerHeight) {
      container.scrollTo({ top: itemBottom - containerHeight, behavior: "smooth" });
    }
  }, [currentIndex]);

  // Эффект для десктопного скролла
  useEffect(() => {
    updateScrollState();
    const el = thumbnailsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, images.length]);

  // Эффект для мобильного скролла
  useEffect(() => {
    updateMobileScrollState();
    const el = mobileThumbnailsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateMobileScrollState);
    const ro = new ResizeObserver(updateMobileScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateMobileScrollState);
      ro.disconnect();
    };
  }, [updateMobileScrollState, images.length]);

  // Скролл миниатюр (десктоп — вертикальный)
  const scrollThumbnails = useCallback((direction: "up" | "down") => {
    const container = thumbnailsRef.current;
    const firstChild = container?.querySelector("[data-thumbnail]");
    if (!container || !firstChild) return;
    const thumbRect = firstChild.getBoundingClientRect();
    const scrollAmount = thumbRect.height + THUMBNAIL_GAP;
    container.scrollBy({
      top: direction === "up" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Скролл миниатюр (мобайл — горизонтальный)
  const scrollMobileThumbnails = useCallback((direction: "left" | "right") => {
    const container = mobileThumbnailsRef.current;
    const firstChild = container?.querySelector("[data-mobile-thumbnail]");
    if (!container || !firstChild) return;
    const thumbRect = firstChild.getBoundingClientRect();
    const scrollAmount = thumbRect.width + THUMBNAIL_GAP_MOBILE;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Переключение главного фото
  const goToPrevImage = useCallback(() => {
    if (currentIndex > 0) {
      onImageSelect(images[currentIndex - 1]);
    }
  }, [currentIndex, images, onImageSelect]);

  const goToNextImage = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onImageSelect(images[currentIndex + 1]);
    }
  }, [currentIndex, images, onImageSelect]);

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[880/920] w-full overflow-hidden bg-muted/40",
          className
        )}
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground">Изображение недоступно</span>
        </div>
      </div>
    );
  }

  // Десктоп: ряд фиксированной высоты 940px; миниатюры адаптивные (до 290px), главное фото 940px по высоте
  return (
    <div className={cn("flex flex-col gap-5 w-full min-w-0", className)}>
      {/* Десктоп: миниатюры слева (адаптивные), главное фото справа 940px высотой */}
      <div className="hidden lg:flex gap-5 w-full h-[940px]">
        {/* Миниатюры слева — адаптивные до 1920px; при 1920+ фиксированные 290px */}
        {images.length > 1 && (
          <div
            className="relative flex flex-col w-[min(290px,25%)] min-w-[140px] min-[1920px]:w-[290px] shrink-0 h-full"
            onMouseEnter={() => setThumbnailsHovered(true)}
            onMouseLeave={() => setThumbnailsHovered(false)}
          >
            {canScrollThumbnails && canScrollUp && (
              <button
                onClick={() => scrollThumbnails("up")}
                className={cn(
                  "absolute top-0 left-0 right-0 z-10 flex items-center justify-center h-10 bg-gradient-to-b from-white/80 to-transparent transition-opacity duration-300 cursor-pointer",
                  thumbnailsHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-label="Прокрутить вверх"
              >
                <ChevronUp className="w-6 h-6 text-foreground/70" />
              </button>
            )}

            <div
              ref={thumbnailsRef}
              className="flex flex-col gap-5 overflow-y-auto scrollbar-none flex-1 min-h-0"
            >
              {images.map((image, index) => (
                <button
                  key={image}
                  data-thumbnail
                  onClick={() => onImageSelect(image)}
                  className={cn(
                    "relative w-full aspect-[290/300] min-[1920px]:w-[290px] min-[1920px]:h-[300px] min-[1920px]:aspect-auto shrink-0 overflow-hidden transition-all duration-300 cursor-pointer",
                    currentImage === image
                      ? "ring-2 ring-primary ring-offset-2 scale-[1.02]"
                      : "hover:opacity-80"
                  )}
                  aria-label={`Выбрать изображение ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Миниатюра ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 25vw, 290px"
                  />
                </button>
              ))}
            </div>

            {canScrollThumbnails && canScrollDown && (
              <button
                onClick={() => scrollThumbnails("down")}
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center h-10 bg-gradient-to-t from-white/80 to-transparent transition-opacity duration-300 cursor-pointer",
                  thumbnailsHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-label="Прокрутить вниз"
              >
                <ChevronDown className="w-6 h-6 text-foreground/70" />
              </button>
            )}
          </div>
        )}

        {/* Главное изображение — высота 940px; при 1920+ ширина 880px */}
        <div
          className="relative flex-1 min-w-[400px] max-w-[880px] min-[1920px]:w-[880px] min-[1920px]:min-w-[880px] min-[1920px]:max-w-[880px] min-[1920px]:flex-none h-full min-h-0 overflow-hidden bg-muted/40"
          onMouseEnter={() => setMainImageHovered(true)}
          onMouseLeave={() => setMainImageHovered(false)}
        >
          <div
            key={currentImage}
            className={cn(
              "absolute inset-0 animate-in fade-in-0 zoom-in-95 duration-300 ease-out",
              imageLoadingStates[currentImage] && "opacity-0 transition-opacity duration-200"
            )}
          >
            <Image
              src={currentImage}
              alt="Товар"
              fill
              className="object-cover"
              priority
              sizes="880px"
              onLoad={() => handleImageLoad(currentImage)}
              onLoadStart={() => handleImageLoadStart(currentImage)}
            />
          </div>

          {imageLoadingStates[currentImage] && (
            <div className="absolute inset-0 animate-pulse bg-muted/40 rounded-[inherit]" />
          )}

          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={goToPrevImage}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/80 cursor-pointer",
                mainImageHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={goToNextImage}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/80 cursor-pointer",
                mainImageHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Мобайл: главное фото сверху, миниатюры снизу */}
      <div className="flex flex-col gap-3 lg:hidden">
        {/* Главное изображение — мобайл */}
        <div
          className="relative w-full aspect-[880/940] overflow-hidden bg-muted/40"
          onMouseEnter={() => setMainImageHovered(true)}
          onMouseLeave={() => setMainImageHovered(false)}
        >
          <div
            key={currentImage}
            className={cn(
              "absolute inset-0 animate-in fade-in-0 zoom-in-95 duration-300 ease-out",
              imageLoadingStates[currentImage] && "opacity-0 transition-opacity duration-200"
            )}
          >
            <Image
              src={currentImage}
              alt="Товар"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              onLoad={() => handleImageLoad(currentImage)}
              onLoadStart={() => handleImageLoadStart(currentImage)}
            />
          </div>

          {imageLoadingStates[currentImage] && (
            <div className="absolute inset-0 animate-pulse bg-muted/40" />
          )}

          {/* Кнопка "Назад" */}
          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={goToPrevImage}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/80 cursor-pointer",
                mainImageHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}

          {/* Кнопка "Вперёд" */}
          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={goToNextImage}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/80 cursor-pointer",
                mainImageHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Следующее изображение"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Миниатюры под главным фото — мобайл, слайдер с кнопками */}
        {images.length > 1 && (
          <div
            className="relative"
            onMouseEnter={() => setMobileThumbnailsHovered(true)}
            onMouseLeave={() => setMobileThumbnailsHovered(false)}
          >
            {/* Кнопка влево */}
            {canScrollLeft && (
              <button
                onClick={() => scrollMobileThumbnails("left")}
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/90 cursor-pointer",
                  mobileThumbnailsHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-label="Прокрутить влево"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}

            {/* Контейнер миниатюр */}
            <div
              ref={mobileThumbnailsRef}
              className="flex gap-3 overflow-x-auto scrollbar-none py-1 px-1"
            >
              {images.map((image, index) => (
                <button
                  key={image}
                  data-mobile-thumbnail
                  onClick={() => onImageSelect(image)}
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 cursor-pointer",
                    currentImage === image
                      ? "ring-2 ring-primary ring-offset-2 scale-[1.03]"
                      : "hover:opacity-80 opacity-70"
                  )}
                  aria-label={`Выбрать изображение ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Миниатюра ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Кнопка вправо */}
            {canScrollRight && (
              <button
                onClick={() => scrollMobileThumbnails("right")}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/90 cursor-pointer",
                  mobileThumbnailsHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-label="Прокрутить вправо"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
