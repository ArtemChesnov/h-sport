"use client";

import Image from "next/image";

interface AuthLayoutProps {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

/**
 * Layout для страниц авторизации: левая колонка с изображением, правая — контент (форма).
 */
export function AuthLayout({ imageSrc, imageAlt, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[1920px] flex">
        {/* Левая часть — изображение */}
        <div className="hidden lg:flex lg:w-[845px] h-[1080px] relative items-center justify-center">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={845}
            height={1080}
            className="object-cover h-100%!"
            priority
          />
          <div className="absolute top-6 left-6">
            <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} />
          </div>
        </div>

        {/* Правая часть — контент */}
        <div className="w-full lg:w-auto lg:flex-1 bg-white flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden mb-8">
              <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
