"use client";

/**
 * Error Boundary для метрик
 * Показывает понятное сообщение об ошибке вместо падения всей страницы
 */

import { AlertCircle } from "lucide-react";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

interface MetricsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface MetricsErrorBoundaryProps {
  children: React.ReactNode;
  /** Заголовок ошибки */
  title?: string;
  /** Описание ошибки */
  description?: string;
  /** Функция для логирования ошибки */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class MetricsErrorBoundary extends React.Component<
  MetricsErrorBoundaryProps,
  MetricsErrorBoundaryState
> {
  constructor(props: MetricsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): MetricsErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);

    // Логирование в консоль для разработки
    if (process.env.NODE_ENV === "development") {
      console.error("Metrics Error Boundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{this.props.title ?? "Ошибка загрузки метрик"}</AlertTitle>
          <AlertDescription className="mt-2">
            {this.props.description ??
              "Произошла ошибка при загрузке метрик. Попробуйте обновить страницу."}
            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer font-medium">Детали ошибки</summary>
                <pre className="mt-2 overflow-auto rounded bg-destructive/10 p-2">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="mt-4"
          >
            Попробовать снова
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
