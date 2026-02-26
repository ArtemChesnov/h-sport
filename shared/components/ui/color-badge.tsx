"use client";

import React from "react";
import {getColorHex} from "@/shared/constants";
import {cva, VariantProps} from "class-variance-authority";
import {cn} from "@/shared/lib";


const colorBadgeVariants = cva(
    " inline-block rounded-full border border-border",
    {
      variants: {
        variant: {
          default: " inline-block rounded-full border border-border",
           outline:
              "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        },
        size: {
          default: "h-4 w-4",
          big: "h-40 w-40",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
);






type ColorBadgeProps = VariantProps<typeof colorBadgeVariants> & {
  colorName: string;
  withLabel?: boolean;
  className?: string;
};


export function ColorBadge({ colorName, withLabel = true, variant, size, className }: ColorBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className={cn(colorBadgeVariants({ variant, size, className }))} style={{ backgroundColor: getColorHex(colorName) }} />
      {withLabel && <span className="text-sm">{colorName}</span>}
    </div>
  );
}
