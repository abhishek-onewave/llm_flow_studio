import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge/Pill per DESIGN.md:
 * - badge-uppercase: transparent bg, body text, utility-xs uppercase
 * - badge-promo: accent-blue-soft bg, link-blue text, full pill radius
 * - pill-tab: full radius, ink bg when active
 * - status variants for semantic colors
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs font-semibold transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-ink text-on-dark px-2 py-0.5",
        secondary:
          "rounded-full bg-surface-soft text-ink px-2 py-0.5",
        outline:
          "rounded-full border border-hairline bg-transparent text-body px-2 py-0.5",
        promo:
          "rounded-full bg-accent-blue-soft text-link-blue px-2 py-0.5 uppercase tracking-wide",
        success:
          "rounded-full bg-accent-green-soft text-accent-green px-2 py-0.5",
        warning:
          "rounded-full bg-[#fff3cd] text-[#856404] px-2 py-0.5",
        destructive:
          "rounded-full bg-accent-red-soft text-accent-red px-2 py-0.5",
        info:
          "rounded-full bg-accent-blue-soft text-accent-blue px-2 py-0.5",
        purple:
          "rounded-full bg-accent-purple-soft text-accent-purple px-2 py-0.5",
        uppercase:
          "bg-transparent text-body uppercase tracking-wide font-bold text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
