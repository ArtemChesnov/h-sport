"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { reportWebVitals } from "@/shared/lib/web-vitals";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000, // 1 минута для динамичных данных (по умолчанию)
        gcTime: 5 * 60 * 1000, // 5 минут для garbage collection (было cacheTime в v4)
      },
    },
  });
}

// На клиенте используем синглтон, чтобы не пересоздавать при навигации
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // На сервере всегда создаём новый QueryClient
    return makeQueryClient();
  } else {
    // В браузере используем синглтон
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  // Создаём QueryClient при монтировании компонента
  const [queryClient] = useState(() => getQueryClient());

  // Инициализируем отслеживание Web Vitals
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: { fontSize: 13 },
        }}
      />
    </QueryClientProvider>
  );
}
