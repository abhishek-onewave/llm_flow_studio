import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input per DESIGN.md:
 * - White bg, 1px hairline border, 6px radius
 * - 36px height, 8px 12px padding
 * - Focus: 2px accent-blue border + focus ring
 * - body-md typography (16px / 400)
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-hairline bg-surface-card px-3 py-2 text-base text-ink transition-colors outline-none",
        "placeholder:text-mute",
        "focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-50",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
