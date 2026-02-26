"use client";

import { ErrorFallbackBlock } from "@/shared/components/common";
import { ArrowLeft } from "lucide-react";
import React from "react";

/**
 * Error Boundary для процесса оформления заказа
 * Показывает fallback в едином стиле
 */
export class CheckoutErrorBoundary extends React.Component<
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
      console.error("Checkout Error Boundary caught an error:", error, errorInfo);
      if (process.env.NODE_ENV === "production") {
        fetch("/api/errors/client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            context: "checkout-error-boundary",
            url: window.location.href,
          }),
        }).catch(() => {});
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
          title="Ошибка оформления заказа"
          description="Во время оформления заказа произошла ошибка. Ваши данные в корзине сохранены. Проверьте подключение к интернету и попробуйте снова."
          onRetry={this.handleReset}
          secondaryAction={{
            href: "/cart",
            label: "Вернуться к корзине",
            icon: ArrowLeft,
          }}
          minHeight="60vh"
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
