"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui";
import { Search, Package, ClipboardList, Users, TicketPercent, LayoutDashboard } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";

type SearchResult = {
  type: "product" | "order" | "user" | "promo" | "dashboard";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SEARCH_SHORTCUTS: SearchResult[] = [
  {
    type: "dashboard",
    id: "dashboard",
    title: "Главная",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    type: "order",
    id: "orders",
    title: "Заказы",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    type: "product",
    id: "products",
    title: "Товары",
    href: "/admin/products",
    icon: Package,
  },
  {
    type: "user",
    id: "users",
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
  },
  {
    type: "promo",
    id: "promos",
    title: "Промокоды",
    href: "/admin/promos",
    icon: TicketPercent,
  },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Определяем, какая ОС используется (для отображения правильного шорткея)
  // Используем useState с проверкой на клиенте для избежания hydration mismatch
  const [shortcutDisplay, setShortcutDisplay] = useState("Ctrl+Shift+K");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Используем requestAnimationFrame для избежания синхронного setState в effect
    requestAnimationFrame(() => {
      setIsMounted(true);
      if (typeof window !== "undefined") {
        const checkMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
                         navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
        setShortcutDisplay(checkMac ? "⌘K" : "Ctrl+Shift+K");
      }
    });
  }, []);

  // Горячая клавиша Ctrl+Shift+K (работает на всех платформах и не конфликтует с браузером)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем, не находится ли фокус в input/textarea
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === "INPUT" ||
                             target.tagName === "TEXTAREA" ||
                             target.isContentEditable ||
                             (target.closest && (target.closest("input") || target.closest("textarea")));

      if (isInputFocused) return;

      // На Mac используем Cmd+K, на Windows Ctrl+Shift+K
      const isMacKey = e.key === "k" && e.metaKey && !e.ctrlKey && !e.shiftKey;
      const isWindowsKey = (e.key === "K" || e.key === "k") && e.ctrlKey && e.shiftKey;

      if (isMacKey || isWindowsKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setOpen((prev) => !prev);
        return;
      }

      // Закрытие по Escape
      if (e.key === "Escape") {
        setOpen((prev) => {
          if (prev) {
            return false;
          }
          return prev;
        });
      }
    };

    // Используем capture фазу для перехвата события раньше всех
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const filteredResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return SEARCH_SHORTCUTS;
    }

    const query = searchQuery.toLowerCase();
    return SEARCH_SHORTCUTS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 sm:gap-2 rounded-lg border border-border/50 bg-gradient-to-r from-white to-slate-50/50 px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-3 md:py-2 text-xs sm:text-sm text-muted-foreground transition-all hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 hover:text-foreground hover:border-indigo-200/50 shadow-sm shrink-0"
        title={`Глобальный поиск (${shortcutDisplay})`}
      >
        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden md:inline">Поиск...</span>
        <kbd
          className="pointer-events-none hidden h-4 sm:h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1 sm:px-1.5 font-mono text-[9px] sm:text-[10px] font-medium opacity-100 sm:flex"
          suppressHydrationWarning
        >
          {isMounted ? shortcutDisplay : "Ctrl+Shift+K"}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl border-0 bg-gradient-to-br from-white via-white/98 to-slate-50/50 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 overflow-hidden">
          <DialogTitle className="sr-only">
            Глобальный поиск
          </DialogTitle>
          <DialogDescription className="sr-only">
            Поиск и быстрый переход по разделам админ-панели
          </DialogDescription>
          <Command className="rounded-lg border-none bg-transparent">
            <div className="border-b border-border/8 bg-gradient-to-r from-transparent via-slate-50/40 to-transparent">
              <CommandInput
                placeholder="Поиск по админке... (заказы, товары, пользователи)"
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-16 text-base border-0 focus:ring-0 focus:border-0 transition-colors bg-transparent placeholder:text-muted-foreground/50 font-medium"
              />
            </div>
            <CommandList className="max-h-[450px] px-3 py-4">
              <CommandEmpty className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
                    <Search className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-sm font-medium text-muted-foreground">Ничего не найдено</span>
                    <span className="block text-xs text-muted-foreground/70">Попробуйте другой запрос</span>
                  </div>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Быстрый переход" className="px-1 py-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                {filteredResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result.href)}
                      className="group relative flex items-center gap-3 px-5 py-4 cursor-pointer rounded-xl transition-all duration-200 ease-out select-none mx-1 mb-1.5 hover:!bg-gradient-to-r hover:!from-indigo-50/85 hover:!to-violet-50/85 hover:!text-foreground hover:!shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] data-[selected=true]:!bg-gradient-to-r data-[selected=true]:!from-indigo-100/95 data-[selected=true]:!to-violet-100/95 data-[selected=true]:!text-foreground data-[selected=true]:!shadow-xl data-[selected=true]:!border data-[selected=true]:!border-indigo-200/70 data-[selected=true]:!scale-[1.01] aria-selected:!bg-gradient-to-r aria-selected:!from-indigo-100/95 aria-selected:!to-violet-100/95 aria-selected:!text-foreground aria-selected:!shadow-xl aria-selected:!border aria-selected:!border-indigo-200/70 active:scale-[0.98] active:translate-y-0"
                    >
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 via-indigo-50/95 to-violet-100 border border-indigo-200/60 shadow-sm group-hover:!shadow-xl group-hover:!scale-110 group-hover:!border-indigo-300/90 group-hover:!from-indigo-200/95 group-hover:!to-violet-200/95 transition-all duration-200 ease-out data-[selected]:!border-indigo-400/80 data-[selected]:!shadow-xl data-[selected]:!from-indigo-200/95 data-[selected]:!to-violet-200/95 pointer-events-none">
                        <Icon className="h-5 w-5 text-indigo-600/90 group-hover:!text-indigo-700 group-hover:!scale-110 transition-all duration-200 data-[selected]:!text-indigo-700 pointer-events-none" />
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pointer-events-none">
                        <span className="font-semibold text-sm text-foreground group-hover:!text-foreground transition-colors">{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted-foreground/70 group-hover:!text-muted-foreground/90 transition-colors">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:!opacity-100 data-[selected]:!opacity-100 transition-opacity duration-200 transform translate-x-[-6px] group-hover:!translate-x-0 pointer-events-none">
                        <svg
                          className="h-4 w-4 text-indigo-500/70 group-hover:!text-indigo-600 transition-all duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t border-border/10 bg-gradient-to-r from-slate-50/60 via-transparent to-slate-50/60 px-6 py-4 flex items-center justify-between text-xs text-muted-foreground/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-border/30 bg-white/90 backdrop-blur-sm px-2 py-1 font-mono text-[10px] font-medium shadow-sm ring-1 ring-black/5">
                Esc
              </kbd>
              <span className="text-[11px] font-medium">закрыть</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-border/30 bg-white/90 backdrop-blur-sm px-2 py-1 font-mono text-[10px] font-medium shadow-sm ring-1 ring-black/5">
                ↑↓
              </kbd>
              <span className="text-[11px] font-medium">навигация</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-border/30 bg-white/90 backdrop-blur-sm px-2 py-1 font-mono text-[10px] font-medium shadow-sm ring-1 ring-black/5">
                ⏎
              </kbd>
              <span className="text-[11px] font-medium">выбрать</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
