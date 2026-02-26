/**
 * Страница запроса восстановления пароля
 */

"use client";

import { AuthLayout } from "@/shared/components/common/auth";
import { DesignButton } from "@/shared/components/ui/design-button";
import { AUTH_VALIDATION, INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || TOAST.ERROR.GENERIC);
        return;
      }

      toast.success(TOAST.SUCCESS.EMAIL_SENT);
      router.push("/auth/sign-in");
    } catch {
      toast.error(TOAST.ERROR.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc="/assets/images/auth/password-reset.webp" imageAlt="Password Reset">
      <Link
              href="/auth/sign-in"
              className="flex items-center text-sm text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Забыли пароль?</h1>
              <p className="text-neutral-600">
                Введите вашу электронную почту и мы отправим вам ссылку на восстановление пароля
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: AUTH_VALIDATION.email.required,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: AUTH_VALIDATION.email.invalid,
                    },
                  })}
                  className={INPUT_FIELD_CLASS}
                  placeholder="hsport@mail.ru"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <DesignButton
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full h-14 rounded-[10px] border-0 text-base"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Отправить"}
              </DesignButton>
            </form>

            <p className="text-center text-sm text-neutral-600">
              Вспомнили пароль?{" "}
              <Link href="/auth/sign-in" className="text-pink-600 hover:text-pink-700 font-medium">
                Войти
              </Link>
            </p>
    </AuthLayout>
  );
}
