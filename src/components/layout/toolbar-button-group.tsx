import { cn } from "@/lib/utils";

export function ToolbarButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-hairline bg-surface-card",
        "[&>*]:border-r [&>*]:border-hairline [&>*:last-child]:border-r-0",
        "[&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md",
        className
      )}
    >
      {children}
    </div>
  );
}
