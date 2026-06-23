"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

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
  userEmail,
  workspaceName,
}: {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  userEmail?: string | null;
  workspaceName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = userEmail ? userEmail[0].toUpperCase() : "?";

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

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-7 items-center justify-center rounded-full bg-primary-cta text-xs font-bold text-on-primary"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-md border border-hairline bg-surface-card py-1">
                {userEmail && (
                  <div className="border-b border-hairline-soft px-3 py-2">
                    <p className="truncate text-xs font-medium text-ink">{userEmail}</p>
                    {workspaceName && (
                      <p className="truncate text-[10px] text-mute">{workspaceName}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-body transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
