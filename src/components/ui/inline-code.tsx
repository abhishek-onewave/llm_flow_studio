import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * InlineCode per DESIGN.md:
 * - Background: surface-soft (#e5e7e0)
 * - Text: ink (#23251d)
 * - Font: code-xs (Source Code Pro, 14px, 500, 1.43)
 * - Padding: 2px 6px
 * - Rounded: 2px (rounded-xs equivalent)
 */
function InlineCode({
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn(
        "rounded-[2px] bg-surface-soft px-1.5 py-0.5 font-mono text-sm font-medium text-ink",
        className
      )}
      {...props}
    />
  );
}

export { InlineCode };
