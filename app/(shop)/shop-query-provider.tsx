"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/app/providers";

/**
 * Дублирует QueryClientProvider в дереве магазина, чтобы при гидрации
 * клиентские компоненты (NewProductsList и др.) гарантированно находили контекст.
 * Использует тот же getQueryClient(), что и корневой Providers — один кэш на приложение.
 */
export function ShopQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
