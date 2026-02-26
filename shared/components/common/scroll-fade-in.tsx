"use client";

import { cn } from "@/shared/lib";
import React, { useEffect, useRef } from "react";

type ScrollFadeInProps = {
  children: React.ReactNode;
  className?: string;
  /** Отступ от верха viewport, когда начинается анимация (0–1) */
  start?: string;
};

/**
 * Обёртка: плавное появление при входе в viewport.
 * Уважает prefers-reduced-motion. gsap загружается лениво.
 */
export function ScrollFadeIn({ children, className, start = "top 88%" }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let ctx: { revert: () => void } | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      }, el);
    })();

    return () => ctx?.revert();
  }, [start]);

  return (
    <div ref={ref} className={cn("motion-reduce:opacity-100", className)}>
      {children}
    </div>
  );
}
