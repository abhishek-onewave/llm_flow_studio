"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Workflows", href: "/workflows" },
  { label: "Templates", href: "/templates" },
  { label: "Models", href: "/models" },
  { label: "Integrations", href: "/integrations" },
  { label: "Runs", href: "/runs" },
];

export function AppTopNav({
  onToggleSidebar,
  sidebarOpen,
}: {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-hairline bg-canvas px-4">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          className="inline-flex size-8 items-center justify-center rounded-md text-ink hover:bg-surface-soft lg:hidden"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen ?? false}
        >
          <Menu size={18} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-ink">
            <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="12" r="2" fill="#f7a501" />
          </svg>
          <span className="text-sm font-bold text-ink">LLM Flow Studio</span>
        </Link>
      </div>

      {/* Center: primary nav tabs (desktop) */}
      <nav aria-label="Main navigation" className="ml-8 hidden items-center gap-0.5 lg:flex">
        {primaryNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface-card text-ink"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          className="inline-flex size-8 items-center justify-center rounded-md text-mute hover:bg-surface-soft hover:text-ink"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          className="inline-flex size-8 items-center justify-center rounded-md text-mute hover:bg-surface-soft hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <Link
          href="/workflows/builder"
          className="ml-1 hidden h-8 items-center gap-1.5 rounded-md bg-primary-cta px-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:inline-flex"
        >
          New workflow
        </Link>
        {/* User avatar placeholder */}
        <div className="ml-1 size-7 rounded-full bg-surface-soft border border-hairline" />
      </div>
    </header>
  );
}
