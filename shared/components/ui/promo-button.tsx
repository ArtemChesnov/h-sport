"use client";

import Link from "next/link";
import React from "react";

import { PromoIcon } from "@/shared/components/icons";
import { useShopNav } from "@/shared/contexts";
import { cn } from "@/shared/lib/utils";
import { DesignButton } from "./design-button";

type DesignButtonVariant = React.ComponentProps<typeof DesignButton>["variant"];
type DesignButtonSize = React.ComponentProps<typeof DesignButton>["size"];

interface Props {
  className?: string;
  _variant?: DesignButtonVariant;
  text: string;
  href?: string;
  size?: DesignButtonSize;
  onClick?: () => void;
  keepIconColorOnHover?: boolean;
}

export const PromoButton: React.FC<Props> = ({
  className,
  text,
  _variant = "outline",
  href,
  size = "default",
  onClick,
  keepIconColorOnHover = false,
}) => {
  const { setPendingPath } = useShopNav();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      setPendingPath(href);
    }
  };

  const content = (
    <>
      <span className="font-light leading-[100%]">{text}</span>
      <PromoIcon
        className={cn(
          "stroke-[#1F1E1E] transition-colors",
          !keepIconColorOnHover && "group-hover:stroke-white"
        )}
        alt="promo-button"
        width={28}
        height={28}
      />
    </>
  );

  if (href) {
    return (
      <DesignButton
        size={size}
        variant={_variant}
        className={cn("group flex items-center gap-2.5 rounded-[6px] px-5 py-2.5", className)}
        asChild
      >
        <Link href={href} onClick={(e) => handleClick(e as unknown as React.MouseEvent)}>
          {content}
        </Link>
      </DesignButton>
    );
  }

  return (
    <DesignButton
      size={size}
      variant={_variant}
      onClick={handleClick}
      className={cn("group flex items-center gap-2.5 rounded-[6px] px-5 py-2.5", className)}
    >
      {content}
    </DesignButton>
  );
};
