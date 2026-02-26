"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href: string;
};

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Главная",
  "/admin/orders": "Заказы",
  "/admin/products": "Товары",
  "/admin/users": "Пользователи",
  "/admin/promos": "Промокоды",
  "/admin/metrics": "Метрики",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Если мы на главной странице админки, не показываем breadcrumbs
  if (pathname === "/admin") {
    return null;
  }

  const paths = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Строим breadcrumbs из пути
  let currentPath = "";
  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i];
    currentPath += `/${segment}`;

    // Пропускаем динамические сегменты (числа, UUID и т.д.)
    if (/^\d+$/.test(segment) || /^[a-f0-9-]{36}$/i.test(segment)) {
      // Для динамических сегментов используем более понятные названия
      const parentPath = items[items.length - 1]?.href || "";
      if (parentPath === "/admin/orders") {
        items.push({
          label: `Заказ #${segment}`,
          href: currentPath,
        });
      } else if (parentPath === "/admin/products") {
        items.push({
          label: `Товар #${segment}`,
          href: currentPath,
        });
      } else if (parentPath === "/admin/users") {
        items.push({
          label: `Пользователь #${segment}`,
          href: currentPath,
        });
      } else {
        items.push({
          label: segment,
          href: currentPath,
        });
      }
    } else {
      const label = ROUTE_LABELS[currentPath] || segment;
      items.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: currentPath,
      });
    }
  }

  // Убираем последний элемент, если он совпадает с текущим путем (он не будет ссылкой)
  const lastItem = items[items.length - 1];
  if (lastItem && lastItem.href === pathname) {
    items.pop();
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.href}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
