"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  Menu,
  Newspaper,
  Package,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAdminNav } from "../context/admin-nav-context";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  hoverGradient: string;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Главная",
    icon: LayoutDashboard,
    iconColor: "text-indigo-600",
    hoverGradient: "hover:from-indigo-50/50 hover:to-violet-50/50",
  },
  {
    href: "/admin/orders",
    label: "Заказы",
    icon: ClipboardList,
    iconColor: "text-indigo-600",
    hoverGradient: "hover:from-indigo-50/50 hover:to-violet-50/50",
  },
  {
    href: "/admin/products",
    label: "Товары",
    icon: Package,
    iconColor: "text-teal-600",
    hoverGradient: "hover:from-teal-50/50 hover:to-emerald-50/50",
  },
  {
    href: "/admin/promos",
    label: "Промокоды",
    icon: TicketPercent,
    iconColor: "text-amber-600",
    hoverGradient: "hover:from-amber-50/50 hover:to-orange-50/50",
  },
  {
    href: "/admin/newsletter",
    label: "Рассылки",
    icon: Newspaper,
    iconColor: "text-rose-600",
    hoverGradient: "hover:from-rose-50/50 hover:to-pink-50/50",
  },
  {
    href: "/admin/users",
    label: "Пользователи",
    icon: Users,
    iconColor: "text-slate-600",
    hoverGradient: "hover:from-slate-50/50 hover:to-zinc-50/50",
  },
  {
    href: "/admin/metrics",
    label: "Метрики",
    icon: Activity,
    iconColor: "text-cyan-600",
    hoverGradient: "hover:from-cyan-50/50 hover:to-sky-50/50",
  },
];

function AdminSidebarLink(props: AdminNavItem & { onClick?: () => void }) {
  const { href, label, icon: Icon, iconColor, hoverGradient, onClick } = props;
  const pathname = usePathname();
  const { pendingPath, setPendingPath } = useAdminNav();

  // Оптимистичное переключение: активный пункт по целевому пути при клике, иначе по pathname
  const effectivePath = pendingPath ?? pathname;
  const isActive =
    href === "/admin"
      ? effectivePath === "/admin"
      : effectivePath === href || effectivePath.startsWith(href + "/");

  const handleClick = () => {
    setPendingPath(href);
    onClick?.();
  };

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={handleClick}
      className={[
        "group flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
        isActive
          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
          : `text-muted-foreground hover:bg-gradient-to-r ${hoverGradient} hover:text-foreground`,
      ].join(" ")}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : `${iconColor} group-hover:${iconColor}`}`}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

/**
 * Контент сайдбара (используется и в десктопе, и в мобильном меню)
 */
function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <>
      <div className="mb-6 sm:mb-8 px-2 pb-3 sm:pb-4 border-b border-border/50">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">HS</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-foreground truncate">h-sport</div>
            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Админ панель
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 sm:gap-1 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map((item) => (
          <AdminSidebarLink key={item.href} {...item} onClick={onLinkClick} />
        ))}
      </nav>

      <div className="mt-auto pt-3 sm:pt-4 border-t border-border/50">
        <Link
          href="mailto:jaksan37@gmail.com"
          className="flex items-center gap-1.5 sm:gap-2.5 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-medium text-muted-foreground hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 hover:text-amber-700 transition-all cursor-pointer group"
          onClick={onLinkClick}
        >
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground group-hover:text-amber-600 transition-colors" />
          <span className="flex-1 text-xs truncate">Техническая поддержка</span>
        </Link>
      </div>
    </>
  );
}

/**
 * Сайдбар навигации администратора.
 * Премиум дизайн в едином стиле
 * На мобильных - выдвижное меню (Sheet)
 */
export function AdminSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Мобильное меню (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <button
            className="md:hidden fixed top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border/50 bg-gradient-to-r from-white to-slate-50/50 text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 hover:text-foreground hover:border-indigo-200/50 shadow-sm"
            aria-label="Открыть меню"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[85vw] sm:w-64 p-0 border-r border-border/50 bg-gradient-to-b from-white via-white to-slate-50/30"
        >
          {/* Accessibility: скрытые заголовок и описание для screen readers */}
          <SheetTitle className="sr-only">Навигация админ-панели</SheetTitle>
          <SheetDescription className="sr-only">
            Меню навигации по разделам административной панели
          </SheetDescription>
          <div className="flex flex-col h-full px-3 py-4 sm:px-4 sm:py-6">
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-border/50">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">HS</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                    h-sport
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Админ панель
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0 ml-2"
                aria-label="Закрыть меню"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Десктопный сайдбар */}
      <aside className="hidden w-64 border-r border-border/50 bg-gradient-to-b from-white via-white to-slate-50/30 px-4 py-6 font-sans md:flex md:flex-col shadow-sm">
        <SidebarContent />
      </aside>
    </>
  );
}
