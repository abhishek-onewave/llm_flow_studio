"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Info,
  Rocket,
  GitBranch,
  List,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const docsNavSections = [
  { label: "Introduction", href: "/docs", icon: Info },
  { label: "Quickstart", href: "/docs/quickstart", icon: Rocket },
  { label: "Core Concepts", href: "/docs/concepts", icon: GitBranch },
  { label: "Node Reference", href: "/docs/nodes", icon: List },
  { label: "API Guides", href: "/docs/api", icon: Code2 },
  { label: "Best Practices", href: "/docs/best-practices", icon: CheckCircle2 },
];

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Docs sidebar — 240px per DESIGN.md */}
      <aside className="hidden w-60 shrink-0 border-r border-hairline bg-canvas md:block">
        <div className="p-4">
          {/* Search placeholder */}
          <div className="flex h-9 items-center gap-2 rounded-md border border-hairline bg-surface-card px-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mute">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-sm text-mute">Search docs...</span>
          </div>
        </div>
        <nav className="px-3 pb-4">
          <div className="space-y-0.5">
            {docsNavSections.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-card text-ink"
                      : "text-body hover:bg-surface-soft hover:text-ink"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Doc content area — max 720px per DESIGN.md */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6">{children}</div>
      </div>
    </div>
  );
}
