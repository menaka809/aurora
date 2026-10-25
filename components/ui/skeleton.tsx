import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // A tint of the text colour, so it shows on cards in both themes
      // (bg-muted matches the card surface in light mode).
      className={cn("animate-pulse rounded-md bg-fg/8", className)}
      {...props}
    />
  )
}

export { Skeleton }
