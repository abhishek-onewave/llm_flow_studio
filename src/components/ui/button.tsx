import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variants per DESIGN.md:
 * - primary: #f7a501 bg, #23251d text, 6px radius, 40px height
 * - secondary: #e5e7e0 bg, #23251d text, 6px radius, 40px height
 * - tertiary/ghost: transparent bg, #23251d text
 * - No shadows. No gradients.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-bold text-sm transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary-cta text-on-primary rounded-md border border-transparent hover:bg-primary-pressed active:bg-primary-pressed",
        secondary:
          "bg-surface-soft text-ink rounded-md border border-hairline hover:bg-hairline-soft active:bg-hairline-soft",
        ghost:
          "bg-transparent text-ink rounded-md border border-transparent hover:bg-surface-soft active:bg-surface-soft",
        outline:
          "bg-surface-card text-ink rounded-md border border-hairline hover:bg-surface-soft active:bg-surface-soft",
        destructive:
          "bg-accent-red-soft text-accent-red rounded-md border border-transparent hover:bg-accent-red/10 active:bg-accent-red/20",
        link: "text-link-teal underline-offset-4 hover:underline border-none",
      },
      size: {
        default: "h-10 gap-2 px-4",
        sm: "h-8 gap-1.5 px-3 text-[13px] font-medium",
        lg: "h-11 gap-2 px-5",
        icon: "size-10",
        "icon-sm": "size-8",
        pill: "h-10 gap-2 px-5 rounded-full",
        "pill-sm": "h-8 gap-1.5 px-4 rounded-full text-[13px] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
