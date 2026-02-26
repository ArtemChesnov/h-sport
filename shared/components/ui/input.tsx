import { INPUT_FIELD_CLASS } from "@/shared/constants";
import { cn } from "@/shared/lib/index";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        INPUT_FIELD_CLASS,
        "min-w-0",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

