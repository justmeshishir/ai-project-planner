import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-xl bg-background/30 px-4 py-3 text-sm",
          "border border-border placeholder:text-muted-foreground/50",
          "shadow-[inset_0_2px_4px_oklch(0_0_0/0.25)]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y min-h-[80px]",
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"
