import { cn } from "@/shared/lib";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { DesignButton } from "./design-button";
import { Title } from "./title";

interface Props {
  title: string;
  text: string;
  className?: string;
  imageUrl?: string;
  priority?: boolean;
}

export const InfoBlock: React.FC<Props> = ({
  className,
  title,
  text,
  imageUrl,
  priority = false,
}) => {
  return (
    <div
      className={cn(
        className,
        "mx-auto my-auto flex w-full max-w-[560px] items-center justify-between gap-12",
      )}
    >
      <div className="flex flex-col">
        <div className="w-auto flex flex-col gap-3">
          <Title size="lg" text={title} className="font-extrabold" />
          <p className="text-gray-400 text-lg">{text}</p>
        </div>

        <div className="flex gap-5 mt-6">
          <Link href="/">
            <DesignButton variant="outline" className="gap-2">
              <ArrowLeft />
              На главную
            </DesignButton>
          </Link>
          <a href="">
            <DesignButton variant="outline" className="">
              Обновить
            </DesignButton>
          </a>
        </div>
      </div>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          width={300}
          height={300}
          priority={priority}
        />
      )}
    </div>
  );
};
