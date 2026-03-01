"use client";

import React from "react";

const AccountBreadcrumbContext = React.createContext<{
  customLastLabel: string | null;
  setCustomLastLabel: (label: string | null) => void;
} | null>(null);

export function AccountBreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [customLastLabel, setCustomLastLabel] = React.useState<string | null>(null);
  const value = React.useMemo(() => ({ customLastLabel, setCustomLastLabel }), [customLastLabel]);
  return (
    <AccountBreadcrumbContext.Provider value={value}>{children}</AccountBreadcrumbContext.Provider>
  );
}

export function useAccountBreadcrumbLabel() {
  const ctx = React.useContext(AccountBreadcrumbContext);
  return ctx?.setCustomLastLabel ?? (() => {});
}

export function useAccountBreadcrumbCustomLabel() {
  const ctx = React.useContext(AccountBreadcrumbContext);
  return ctx?.customLastLabel ?? null;
}
