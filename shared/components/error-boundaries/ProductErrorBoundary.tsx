"use client";

import { ErrorFallbackBlock } from "@/shared/components/common";
import React from "react";

/**
 * Error Boundary для карточек товаров
 * Показывает fallback в едином стиле
 */
export class ProductErrorBoundary extends React.Component<
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
    if (typeof window !== "undefined") {
      if (process.env.NODE_ENV === "production") {
        fetch("/api/errors/client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            context: "product-error-boundary",
          }),
        }).catch(() => {});
      } else {
        console.error("Product Error Boundary caught an error:", error, errorInfo);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackBlock
          title="Не удалось загрузить товар"
          description="Произошла ошибка при загрузке информации о товаре. Попробуйте обновить страницу."
          onRetry={this.handleReset}
          secondaryAction={{ href: "/", label: "На главную" }}
          minHeight="60vh"
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
