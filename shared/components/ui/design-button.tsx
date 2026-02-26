import { cn } from "@/shared/lib";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const designButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap h-[56px] cursor-pointer rounded-[10px] text-[16px] text-white font-medium ring-offset-background transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-gray-500 disabled:hover:scale-100 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default: "text-white hover:bg-secondary bg-primary hover:text-primary-foreground ",
        primary: "bg-primary text-white hover:bg-primary/90 hover:text-white",
        outline:
          "bg-transparent text-foreground border border-muted-foreground hover:text-white hover:bg-primary hover:border-transparent",
        ghost: "bg-transparent text-foreground",
        white: "bg-[#F5F5F5] text-text-primary ",
      },
      size: {
        default: "h-auto px-8 py-4",
        sm: "h-9 px-3",
        lg: "h-14  px-8",
        icon: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function DesignButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof designButtonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(designButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { DesignButton, designButtonVariants };

