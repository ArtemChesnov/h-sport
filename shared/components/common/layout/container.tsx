"use client";

import { cn } from "@/shared/lib/utils";
import React from "react";

interface Props {
  className?: string;
}

export const Container: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  return (
    <div className={cn("mx-auto w-full max-w-480 xl:px-7.5 px-3 min-[1920px]:px-0", className)}>
      {children}
    </div>
  );
};
