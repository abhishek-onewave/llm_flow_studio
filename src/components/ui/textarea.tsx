import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea per DESIGN.md:
 * - Same styling as Input: white bg, hairline border, 6px radius
 * - Focus: accent-blue border + ring
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-hairline bg-surface-card px-3 py-2 text-base text-ink transition-colors outline-none",
        "placeholder:text-mute",
        "focus-visible:border-accent-blue focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)]",
        "disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
