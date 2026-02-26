"use client";

import React from "react";
import { ErrorFallbackBlock } from "./error-fallback-block";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    resetError: () => void;
  }>;
}

/**
 * Error Boundary для обработки ошибок React компонентов
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
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
          }),
        }).catch(() => {});
      } else {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }
      return (
        <ErrorFallbackBlock
          onRetry={this.resetError}
          minHeight="screen"
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
