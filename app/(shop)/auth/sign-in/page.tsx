/**
 * Страница входа
 */

"use client";

import { AuthLayout } from "@/shared/components/common/auth";
import { CheckboxOption, DesignButton, PasswordInput } from "@/shared/components/ui";
import { AUTH_VALIDATION, INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { UNAUTHORIZED_FLAG_KEY } from "@/shared/hooks/user/use-auth-check";
import { parseFieldErrors } from "@/shared/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Zod-схема валидации формы входа
const signInSchema = z.object({
  email: z.string().min(1, AUTH_VALIDATION.email.required).email(AUTH_VALIDATION.email.invalid),
  password: z
    .string()
    .min(1, AUTH_VALIDATION.password.required)
    .min(8, AUTH_VALIDATION.password.minLength),
  remember: z.boolean(),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 422) {
          const { fieldErrors, formError } = parseFieldErrors(result);
          if (formError) toast.error(formError);
          Object.entries(fieldErrors).forEach(([field, msg]) => {
            if (field !== "_global" && (field === "email" || field === "password")) {
              setError(field as "email" | "password", { type: "server", message: msg });
            }
          });
        } else if (response.status === 401 || response.status === 403) {
          toast.error(result.message || "Неверный email или пароль");
        } else {
          toast.error(result.message || TOAST.ERROR.GENERIC);
        }
        return;
      }

      // Удаляем флаг неавторизованности из sessionStorage
      // Это критически важно - без этого после перезагрузки запрос не будет делаться
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(UNAUTHORIZED_FLAG_KEY);
        } catch {
          // Игнорируем ошибки sessionStorage
        }
      }

      // НЕ инвалидируем и НЕ удаляем кэш перед перезагрузкой - это может вызвать проблемы
      // При полной перезагрузке страницы (window.location.href) кеш React Query все равно очищается
      // Просто удаляем флаг из sessionStorage, чтобы после перезагрузки запрос выполнился

      toast.success(TOAST.SUCCESS.SIGN_IN);

      // Используем window.location для полной перезагрузки страницы
      // Это гарантирует обновление всех состояний и правильную работу useAuthCheck
      // После перезагрузки cachedProfile будет undefined, флаг удален из sessionStorage,
      // поэтому shouldFetch будет true и запрос выполнится один раз
      window.location.href = "/";
    } catch {
      toast.error(TOAST.ERROR.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc="/assets/images/auth/sign-in.webp" imageAlt="Sign In">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Добро пожаловать!</h1>
        <p className="text-neutral-600">Введите данные для входа</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className={`${INPUT_LABEL_CLASS} mb-2`}>
            Электронная почта
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={INPUT_FIELD_CLASS}
            placeholder="hsport@mail.ru"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={`${INPUT_LABEL_CLASS} mb-2`}>
            Пароль
          </label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex items-center justify-between">
          <Controller
            name="remember"
            control={control}
            render={({ field }) => (
              <CheckboxOption
                checked={field.value}
                onChange={field.onChange}
                label="Запомнить меня"
              />
            )}
          />
          <Link href="/auth/forgot-password" className="text-sm text-pink-600 hover:text-pink-700">
            Забыли пароль?
          </Link>
        </div>

        <DesignButton
          type="submit"
          disabled={isLoading}
          variant="default"
          className="w-full h-14 rounded-[10px] border-0 text-base"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Войти"}
        </DesignButton>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Нет аккаунта?{" "}
        <Link href="/auth/sign-up" className="text-pink-600 hover:text-pink-700 font-medium">
          Зарегистрироваться
        </Link>
      </p>
    </AuthLayout>
  );
}
