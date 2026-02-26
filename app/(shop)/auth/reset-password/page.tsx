/**
 * Страница восстановления пароля
 */

"use client";

import { AuthLayout } from "@/shared/components/common/auth";
import { DesignButton } from "@/shared/components/ui/design-button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AUTH_VALIDATION, INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>();

  const password = watch("password");

  React.useEffect(() => {
    if (!token) {
      toast.error(TOAST.ERROR.TOKEN_NOT_FOUND);
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error(TOAST.ERROR.TOKEN_NOT_FOUND);
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error(TOAST.ERROR.PASSWORDS_MISMATCH);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || TOAST.ERROR.GENERIC);
        return;
      }

      toast.success(TOAST.SUCCESS.PASSWORD_RESET);
      router.push("/auth/password-reset-success");
    } catch {
      toast.error(TOAST.ERROR.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <AuthLayout imageSrc="/assets/images/auth/password-reset.webp" imageAlt="Password Reset">
      <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Восстановление пароля</h1>
              <p className="text-neutral-600">Введите новый пароль</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="password" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Новый пароль
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: AUTH_VALIDATION.password.required,
                    minLength: {
                      value: 8,
                      message: AUTH_VALIDATION.password.minLength,
                    },
                  })}
                  className={INPUT_FIELD_CLASS}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Подтвердите пароль
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: AUTH_VALIDATION.confirmPassword.required,
                    validate: (value) => value === password || AUTH_VALIDATION.confirmPassword.mismatch,
                  })}
                  className={INPUT_FIELD_CLASS}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <DesignButton
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full h-14 rounded-[10px] border-0 text-base"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Изменить пароль"}
              </DesignButton>
            </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout imageSrc="/assets/images/auth/password-reset.webp" imageAlt="Password Reset">
          <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
