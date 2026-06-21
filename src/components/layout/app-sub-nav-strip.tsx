"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSubNavStrip({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-10 items-center gap-1 border-b border-hairline bg-surface-soft px-4 overflow-x-auto">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-1 text-sm font-medium transition-colors",
              isActive
                ? "bg-surface-card text-ink"
                : "text-body hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
