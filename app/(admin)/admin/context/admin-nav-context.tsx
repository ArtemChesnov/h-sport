"use client";

import { usePathname } from "next/navigation";
import React from "react";

type AdminNavContextValue = {
  pendingPath: string | null;
  setPendingPath: (path: string | null) => void;
  isNavigating: boolean;
};

const AdminNavContext = React.createContext<AdminNavContextValue | null>(null);

/**
 * Провайдер навигации админки: хранит «целевой путь» при клике по пункту меню,
 * сбрасывает его при совпадении с pathname. Нужен для оптимистичного сайдбара и индикатора загрузки.
 */
export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingPath, setPendingPathState] = React.useState<string | null>(null);

  const setPendingPath = React.useCallback((path: string | null) => {
    setPendingPathState(path);
  }, []);

  React.useEffect(() => {
    if (pendingPath == null) return;
    const matches =
      pendingPath === "/admin"
        ? pathname === "/admin"
        : pathname === pendingPath || pathname.startsWith(pendingPath + "/");
    if (matches) {
      setPendingPathState(null);
    }
  }, [pathname, pendingPath]);

  const isNavigating = pendingPath != null;

  const value = React.useMemo<AdminNavContextValue>(
    () => ({
      pendingPath,
      setPendingPath,
      isNavigating,
    }),
    [pendingPath, isNavigating, setPendingPath]
  );

  return <AdminNavContext.Provider value={value}>{children}</AdminNavContext.Provider>;
}

export function useAdminNav() {
  const ctx = React.useContext(AdminNavContext);
  if (!ctx) {
    return {
      pendingPath: null,
      setPendingPath: () => {},
      isNavigating: false,
    };
  }
  return ctx;
}
