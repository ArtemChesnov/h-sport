"use client";

import { cn } from "@/shared/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

type TabId = "description" | "delivery" | "returns";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "description", label: "Описание" },
  { id: "delivery", label: "Доставка" },
  { id: "returns", label: "Возврат" },
];

interface ProductTabsProps {
  description?: string | null;
  className?: string;
}

const DELIVERY_TEXT = `Доставка осуществляется по всей России.

Бесплатная доставка при заказе от 10000 ₽.

Срок доставки: 2-7 рабочих дней в зависимости от региона.

Также доступен самовывоз из нашего шоурума.`;

const RETURNS_TEXT = `Возврат товара возможен в течение 14 дней с момента получения.

Товар должен сохранять товарный вид, не быть в употреблении, иметь все бирки и ярлыки.

Для оформления возврата свяжитесь с нашей службой поддержки.`;

/**
 * Табы с описанием, доставкой и возвратом
 * Анимированный индикатор активного таба
 */
export function ProductTabs({ description, className }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    description: null,
    delivery: null,
    returns: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    const activeTabEl = tabRefs.current[activeTab];
    const container = containerRef.current;

    if (activeTabEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
      });
    }
  }, [activeTab]);

  // Обновляем позицию индикатора при смене таба и при ресайзе контейнера
  useEffect(() => {
    updateIndicator();

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(updateIndicator);
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateIndicator]);

  const getTabContent = (tabId: TabId): string => {
    switch (tabId) {
      case "description":
        return description || "Описание товара отсутствует.";
      case "delivery":
        return DELIVERY_TEXT;
      case "returns":
        return RETURNS_TEXT;
    }
  };

  return (
    <div className={cn("", className)}>
      {/* Заголовки табов */}
      <div ref={containerRef} className="flex w-full mt-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "text-[20px] leading-[140%] h-10 text-center font-normal w-full cursor-pointer transition-colors duration-200",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Линия с индикатором */}
      <div className="h-[2px] bg-muted w-full relative">
        <div
          className="bg-text-primary h-[4px] absolute -top-[1px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: indicatorStyle.width,
            left: indicatorStyle.left,
          }}
        />
      </div>

      {/* Контент таба */}
      <div className="mt-4 overflow-hidden">
        <p key={activeTab} className="text-[16px] font-light leading-[150%] animate-fade-in-up">
          {getTabContent(activeTab)}
        </p>
      </div>
    </div>
  );
}
