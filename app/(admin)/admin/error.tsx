"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/ui";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логируем ошибку
    if (typeof window !== "undefined") {
      fetch("/api/errors/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          context: "admin",
        }),
      }).catch(() => {
        // Игнорируем ошибки логирования
      });
    }
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-lg">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center shadow-sm">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Ошибка в админ-панели
          </h2>
          <p className="text-sm text-slate-600">
            Произошла ошибка при загрузке страницы. Это может быть временная проблема.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
          >
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>

          <Button variant="outline" asChild>
            <Link href="/admin" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              На главную админки
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-slate-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
