/**
 * Страница подтверждения email
 */

"use client";

import { DesignButton } from "@/shared/components/ui/design-button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");

  const getMessage = () => {
    if (success) {
      return {
        title: "Email успешно подтверждён!",
        message: "Ваш email был успешно подтверждён. Теперь вы можете пользоваться всеми функциями сервиса.",
        icon: CheckCircle2,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
      };
    }

    if (error === "invalid_token" || error === "missing_token") {
      return {
        title: "Неверная ссылка",
        message: "Ссылка для подтверждения email недействительна или истекла. Пожалуйста, запросите новую ссылку.",
        icon: XCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-100",
      };
    }

    return {
      title: "Ошибка подтверждения",
      message: "Произошла ошибка при подтверждении email. Пожалуйста, попробуйте позже.",
      icon: XCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
    };
  };

  const { title, message, icon: Icon, iconColor, bgColor } = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6 text-center">
        <div className={`w-20 h-20 rounded-full ${bgColor} flex items-center justify-center mx-auto`}>
          <Icon className={`w-12 h-12 ${iconColor}`} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
          <p className="text-neutral-600">{message}</p>
        </div>

        <div className="space-y-3">
          {success ? (
            <Link href="/auth/sign-in">
              <DesignButton variant="default" className="w-full h-14 rounded-[10px] border-0 text-base">Войти в аккаунт</DesignButton>
            </Link>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <DesignButton variant="default" className="w-full h-14 rounded-[10px] border-0 text-base">Вернуться ко входу</DesignButton>
              </Link>
              <Link href="/auth/forgot-password">
                <DesignButton variant="outline" className="w-full h-14">
                  Запросить новую ссылку
                </DesignButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
            <Skeleton className="w-20 h-20 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
