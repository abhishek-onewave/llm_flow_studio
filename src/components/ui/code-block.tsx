"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * CodeBlock per DESIGN.md:
 * - Background: surface-dark (#23251d)
 * - Text: on-dark (#ffffff)
 * - Font: code-sm (Source Code Pro, 14px, 400, 1.43 line-height)
 * - Padding: 16px 20px
 * - Rounded: 6px (rounded-md)
 */
function CodeBlock({
  className,
  children,
  language,
  title,
  ...props
}: React.ComponentProps<"div"> & {
  language?: string;
  title?: string;
}) {
  return (
    <div
      data-slot="code-block"
      className={cn("rounded-md bg-surface-dark overflow-hidden", className)}
      {...props}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-2">
          {language && (
            <span className="font-mono text-xs font-medium text-white/50 uppercase">
              {language}
            </span>
          )}
          <span className="font-mono text-xs text-white/70">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-5 py-4">
        <code className="font-mono text-sm leading-[1.43] text-on-dark">
          {children}
        </code>
      </pre>
    </div>
  );
}

export { CodeBlock };
