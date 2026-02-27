"use client";

import { CART_LABELS } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
import { env } from "@/shared/lib/env.client";
import { createBreadcrumbJsonLd, JsonLd } from "@/shared/lib/seo/json-ld";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href: string;
};

interface ShopBreadcrumbsProps {
  /** Кастомная метка для последнего элемента (например, название товара) */
  customLastLabel?: string;
  /** Дополнительные классы */
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Главная",
  "/about": "О нас",
  "/catalog": "Каталог",
  "/cart": CART_LABELS.title,
  "/favorites": "Избранное",
  "/privacy": "Политика конфиденциальности",
  "/showroom": "Шоурум",
  "/checkout": "Оформление доставки",
  "/checkout/payment": "Оплата",
  "/checkout/success": "Завершение",
  "/account": "Личный кабинет",
  "/account/orders": "Мои заказы",
  "/account/favorites": "Избранное",
  "/product": "Товар",
};

export function ShopBreadcrumbs({ customLastLabel, className }: ShopBreadcrumbsProps = {}) {
  const pathname = usePathname();
  const { setPendingPath } = useShopNav();

  const handleLinkClick = (href: string) => {
    setPendingPath(href);
  };

  // Если мы на главной странице, не показываем breadcrumbs
  if (pathname === "/") {
    return null;
  }

  const paths = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Строим breadcrumbs из пути
  let currentPath = "";
  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i];
    currentPath += `/${segment}`;

    // Проверяем, есть ли метка для этого пути
    // Для страницы продукта (/product/[slug]) используем только /product
    const lookupPath = currentPath.startsWith("/product/") ? "/product" : currentPath;
    const label = ROUTE_LABELS[lookupPath] || segment;

    items.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: currentPath,
    });
  }

  // Применяем кастомную метку для последнего элемента
  if (customLastLabel && items.length > 0) {
    items[items.length - 1].label = customLastLabel;
  }

  // Не удаляем последний элемент, просто не делаем его ссылкой (обрабатывается в рендере)
  if (items.length === 0) {
    return null;
  }

  // Один и тот же baseUrl на сервере и клиенте, иначе разный JSON-LD → hydration mismatch
  const baseUrl = env.appUrl;
  const allItems = [
    { name: "Главная", url: baseUrl + "/" },
    ...items.map((i) => ({ name: i.label, url: baseUrl + i.href })),
  ];
  const breadcrumbJsonLd = createBreadcrumbJsonLd(allItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <nav
        className={`flex flex-wrap items-center gap-1 min-w-0 pt-4 text-xs text-neutral-500 sm:gap-2 sm:pt-6 sm:text-sm ${className || ""}`}
        aria-label="Хлебные крошки"
      >
        <Link
          href="/"
          onClick={() => handleLinkClick("/")}
          className="link-underline shrink-0 hover:text-[#EB6081] transition-colors duration-200"
        >
          Главная
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div
              key={`${item.href}-${index}`}
              className="flex items-center gap-1 min-w-0 shrink-0 sm:gap-2 transition-opacity duration-200"
            >
              <ChevronRight className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              {isLast ? (
                <span
                  className="font-medium text-[#EB6081] min-w-0 max-w-[55vw] truncate sm:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className="link-underline hover:text-[#EB6081] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
