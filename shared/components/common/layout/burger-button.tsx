"use client";

import { BurgerIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import React from "react";
import { DesignButton } from "../../ui/design-button";
import { MenuDrawer } from "./menu-drawer";

interface Props {
  className?: string;
}

export const BurgerButton: React.FC<Props> = ({ className }) => {
  return (
    <MenuDrawer className={className}>
      <DesignButton
        variant="ghost"
        size="icon"
        className={cn(
          "group h-10 w-10 min-w-10 md:h-[42px] md:w-[42px] md:min-w-[42px]",
          className
        )}
      >
        <BurgerIcon className="w-8 h-8 text-[#EB6081] transition-colors group-hover:text-primary md:w-[42px] md:h-[42px] scale-x-[-1] md:scale-x-100" />
      </DesignButton>
    </MenuDrawer>
  );
};
