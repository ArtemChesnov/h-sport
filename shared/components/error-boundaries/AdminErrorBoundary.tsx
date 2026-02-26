"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

/**
 * Error Boundary для админ-панели
 * Показывает детальную информацию об ошибке для разработчиков/администраторов
 */
export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // В админке логируем более детально
    if (typeof window !== "undefined") {
      console.error("Admin Error Boundary caught an error:", error, errorInfo);

      if (process.env.NODE_ENV === "production") {
        // В production отправляем ошибку на сервер для логирования
        fetch("/api/errors/client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            context: "admin-error-boundary",
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        }).catch(() => {
          // Игнорируем ошибки отправки
        });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6 max-w-4xl">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Ошибка в админ-панели
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Что-то пошло не так</AlertTitle>
                <AlertDescription>
                  Произошла ошибка в административной панели. Для диагностики проблемы
                  обратитесь к логам сервера или перезагрузите страницу.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Попробовать снова
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                >
                  Перезагрузить страницу
                </Button>
              </div>

              {/* Детальная информация для админов */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                    Технические детали ошибки
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <strong className="text-foreground">Сообщение:</strong>
                      <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                        {this.state.error?.message || "Неизвестная ошибка"}
                      </pre>
                    </div>
                    {this.state.error?.stack && (
                      <div>
                        <strong className="text-foreground">Stack trace:</strong>
                        <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      URL: {typeof window !== "undefined" ? window.location.href : "N/A"}
                      <br />
                      Время: {new Date().toLocaleString()}
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
