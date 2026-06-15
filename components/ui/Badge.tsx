import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "accent"
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-secondary text-muted-foreground border border-border/30",
      outline:
        "bg-transparent text-muted-foreground border border-border",
      accent:
        "bg-accent/15 text-teal border-accent/20",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "micro-label inline-flex items-center rounded-full px-2.5 py-0.5",
          variants[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = "Badge"
