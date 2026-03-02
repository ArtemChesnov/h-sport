"use client";

import Image from "next/image";

interface AuthLayoutProps {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

/**
 * Layout для страниц авторизации: левая колонка с изображением, правая — контент (форма).
 * Контент ровно по высоте экрана, фото не смещается; при длинной форме скроллится только форма.
 */
export function AuthLayout({ imageSrc, imageAlt, children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen min-h-screen max-h-screen overflow-hidden">
      <div className="w-full max-w-[1920px] flex flex-1 min-h-0">
        {/* Левая часть — изображение на всю высоту экрана */}
        <div className="hidden lg:flex lg:w-[845px] min-h-screen h-screen relative shrink-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={845}
            height={1080}
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute top-6 left-6">
            <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} />
          </div>
        </div>

        {/* Правая часть — контент, скролл только у формы */}
        <div className="w-full lg:w-auto lg:flex-1 min-h-0 flex items-center justify-center overflow-auto p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8 my-auto">
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
