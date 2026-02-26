"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * GSAP-анимация появления блоков страницы товара (галерея, инфо, табы).
 * Вызывать после рендера контента, когда productId задан.
 */
export function useProductPageReveal(
  galleryRef: RefObject<HTMLDivElement | null>,
  infoRef: RefObject<HTMLDivElement | null>,
  tabsRef: RefObject<HTMLDivElement | null>,
  productId: number | undefined
) {
  useEffect(() => {
    if (!productId) return;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const els = [galleryRef.current, infoRef.current, tabsRef.current].filter(Boolean);
    if (els.length === 0) return;
    gsap.set(els, { opacity: 0, y: 20 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [productId, galleryRef, infoRef, tabsRef]);
}
