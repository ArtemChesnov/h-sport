import { cn } from "@/shared/lib"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded-md animate-shimmer motion-reduce:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
