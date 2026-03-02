"use client";

import Image from "next/image";

interface AuthLayoutProps {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

/**
 * Layout для страниц авторизации: левая колонка с изображением, правая — контент (форма).
 * Правая колонка растягивается на всю доступную ширину, форма отцентрована в ней.
 * При длинной форме скроллится только форма.
 */
export function AuthLayout({ imageSrc, imageAlt, children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen min-h-screen max-h-screen overflow-hidden">
      <div className="w-full flex flex-1 min-h-0">
        {/* Левая часть — фото, занимает всё оставшееся место (правая колонка ограничена по ширине) */}
        <div className="hidden lg:flex lg:h-screen lg:flex-1 lg:min-w-0 relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1024}
            height={825}
            className="object-left w-auto h-full"
            priority
          />
          <div className="absolute top-6 left-6">
            <Image src="/logo-icon.png" alt="H-Sport" width={40} height={40} />
          </div>
        </div>

        {/* Правая часть — растягивается на всё доступное место, форма по центру */}
        <div className="w-full lg:flex-1 lg:min-w-0 min-h-0 flex items-center justify-center overflow-auto p-6 lg:p-12">
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
