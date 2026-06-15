import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-primary text-primary-foreground font-semibold rounded-full hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-primary/25 glow-amber",
  outline:
    "border border-border bg-transparent rounded-full text-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/8 transition-colors",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors",
} as const

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-9 w-9",
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
