"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  BookTemplate,
  Cpu,
  Plug,
  Play,
  FolderOpen,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workflows", href: "/workflows", icon: GitBranch },
  { label: "Templates", href: "/templates", icon: BookTemplate },
  { label: "Models", href: "/models", icon: Cpu },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Runs", href: "/runs", icon: Play },
  { label: "Files", href: "/files", icon: FolderOpen },
];

const bottomNavItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Docs & Help", href: "/docs", icon: HelpCircle },
];

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const sidebar = (
    <aside className="flex h-full w-60 flex-col border-r border-hairline bg-canvas">
      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-card text-ink"
                    : "text-body hover:bg-surface-soft hover:text-ink"
                )}
              >
                <Icon size={16} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-hairline px-3 py-3">
        <div className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-card text-ink"
                    : "text-body hover:bg-surface-soft hover:text-ink"
                )}
              >
                <Icon size={16} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
        {/* Mascot decoration */}
        <div className="mt-4 flex justify-center opacity-40">
          <MascotPlaceholder size="sm" mood="neutral" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            {sidebar}
          </div>
        </>
      )}
    </>
  );
}
