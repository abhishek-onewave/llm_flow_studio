import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Callout banners per DESIGN.md:
 * - banner-tip-blue: #dceaf6 bg, ink text
 * - banner-tip-green: #d9eddf bg, ink text
 * - banner-tip-red: #f7d6d3 bg, ink text
 * - banner-tip-purple: #e7d8ee bg, ink text
 * - Padding: 16px 20px, rounded: 6px
 * - Each prefixed with emoji icon
 */
const calloutVariants = cva(
  "flex gap-3 rounded-md px-5 py-4 text-base text-ink leading-relaxed",
  {
    variants: {
      variant: {
        info: "bg-accent-blue-soft",
        success: "bg-accent-green-soft",
        warning: "bg-accent-red-soft",
        note: "bg-accent-purple-soft",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const calloutIcons: Record<string, string> = {
  info: "\u{1F4A1}",
  success: "\u2705",
  warning: "\u26A0\uFE0F",
  note: "\u{1F4D8}",
};

const calloutLabels: Record<string, string> = {
  info: "Tip",
  success: "Success",
  warning: "Warning",
  note: "Note",
};

function Callout({
  className,
  variant = "info",
  title,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof calloutVariants> & {
    title?: string;
  }) {
  const v = variant ?? "info";
  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      <span className="shrink-0 text-base leading-relaxed" aria-hidden>
        {calloutIcons[v]}
      </span>
      <div className="flex-1 min-w-0">
        <span className="font-semibold">
          {title ?? calloutLabels[v]}
        </span>
        {children && <span className="ml-1.5">{children}</span>}
      </div>
    </div>
  );
}

export { Callout, calloutVariants };
