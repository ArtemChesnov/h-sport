/**
 * Страница регистрации
 */

"use client";

import { AuthLayout } from "@/shared/components/common/auth";
import { CheckboxOption, DesignButton, PasswordInput } from "@/shared/components/ui";
import { AUTH_VALIDATION, INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { parseFieldErrors } from "@/shared/lib/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface SignUpForm {
  name: string;
  secondName: string;
  email: string;
  password: string;
  agree: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const SIGN_UP_FIELDS = ["name", "secondName", "email", "password", "agree"] as const;
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpForm>({
    defaultValues: {
      name: "",
      secondName: "",
      email: "",
      password: "",
      agree: false,
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    if (!data.agree) {
      toast.error(TOAST.ERROR.TERMS_REQUIRED);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          secondName: data.secondName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 422) {
          const { fieldErrors, formError } = parseFieldErrors(result);
          if (formError) toast.error(formError);
          SIGN_UP_FIELDS.forEach((field) => {
            const msg = fieldErrors[field];
            if (msg) setError(field, { type: "server", message: msg });
          });
        } else {
          toast.error(result.message || TOAST.ERROR.GENERIC);
        }
        return;
      }

      toast.success(TOAST.SUCCESS.REGISTRATION);
      router.push("/auth/sign-in");
    } catch {
      toast.error(TOAST.ERROR.GENERIC);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout imageSrc="/assets/images/auth/sign-up.webp" imageAlt="Sign Up">
      <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Создать новый аккаунт</h1>
              <p className="text-neutral-600">Введите данные для регистрации</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="name" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Имя
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name", { required: AUTH_VALIDATION.name.required })}
                  className={INPUT_FIELD_CLASS}
                  placeholder="Введите ваше имя"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="secondName" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Фамилия
                </label>
                <input
                  id="secondName"
                  type="text"
                  {...register("secondName")}
                  className={INPUT_FIELD_CLASS}
                  placeholder="Введите вашу фамилию"
                />
              </div>

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

              <div>
                <label htmlFor="password" className={`${INPUT_LABEL_CLASS} mb-2`}>
                  Пароль
                </label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password", {
                    required: AUTH_VALIDATION.password.required,
                    minLength: {
                      value: 8,
                      message: AUTH_VALIDATION.password.minLength,
                    },
                  })}
                />
              </div>

              <div>
                <Controller
                  name="agree"
                  control={control}
                  rules={{ required: AUTH_VALIDATION.agree.required }}
                  render={({ field }) => (
                    <CheckboxOption
                      checked={field.value}
                      onChange={field.onChange}
                      label="Я согласен с условиями пользовательского соглашения"
                    />
                  )}
                />
                {errors.agree && <p className="text-sm text-red-600 mt-1">{errors.agree.message}</p>}
              </div>

              <DesignButton
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full h-14 rounded-[10px] border-0 text-base"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Зарегистрироваться"}
              </DesignButton>
            </form>

            <p className="text-center text-sm text-neutral-600">
              Уже есть аккаунт?{" "}
              <Link href="/auth/sign-in" className="text-pink-600 hover:text-pink-700 font-medium">
                Войти
              </Link>
            </p>
    </AuthLayout>
  );
}
