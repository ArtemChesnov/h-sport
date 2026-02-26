/**
 * Индикатор прогресса навигации
 * Показывает тонкую полоску сверху при переходах между страницами
 */

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Используем requestAnimationFrame для асинхронного обновления состояния
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    const startProgress = () => {
      setIsLoading(true);
      setProgress(0);

      // Анимация прогресса
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 50);

      timer = setTimeout(() => {
        setProgress(100);
        // Используем requestAnimationFrame вместо setTimeout для более плавной анимации
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsLoading(false);
            setProgress(0);
          });
        });
      }, 300);
    };

    // Запускаем анимацию в следующем кадре
    const animationFrameId = requestAnimationFrame(startProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none">
      <div
        className="h-full bg-[#EB6081] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          transition: 'width 0.2s ease-out',
        }}
      />
    </div>
  );
}
