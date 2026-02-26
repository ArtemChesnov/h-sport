/**
 * Страница успешной смены пароля
 */

"use client";

import { DesignButton } from "@/shared/components/ui/design-button";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PasswordResetSuccessPage() {
  return (
    <div className="flex min-h-screen">
      {/* Левая часть - изображение */}
      <div className="hidden lg:block lg:w-2/3 relative">
        <Image
          src="/assets/images/auth/password-reset-ok.webp"
          alt="Password Reset Success"
          fill
          className="object-cover  h-100%!"
          priority
        />
        <div className="absolute top-6 left-6">
          <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} />
        </div>
      </div>

      {/* Правая часть - сообщение */}
      <div className="w-full lg:w-1/3 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="lg:hidden mb-8">
            <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} className="mx-auto" />
          </div>

          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-pink-600" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">Пароль успешно изменён</h1>
            <p className="text-neutral-600">
              Ваш пароль был успешно изменён. Теперь вы можете войти в систему с новым паролем.
            </p>
          </div>

          <Link href="/auth/sign-in">
            <DesignButton
              variant="default"
              className="w-full h-14 rounded-[10px] border-0 text-base"
            >
              Вернуться ко входу
            </DesignButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
