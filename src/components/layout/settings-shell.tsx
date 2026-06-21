"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  CreditCard,
  Gauge,
  Key,
  Lock,
  Shield,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

const settingsNavItems = [
  { label: "Workspace", href: "/settings", icon: Building2 },
  { label: "Members", href: "/settings/members", icon: Users },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Usage Limits", href: "/settings/usage", icon: Gauge },
  { label: "API Keys", href: "/settings/api-keys", icon: Key },
  { label: "Secrets", href: "/settings/secrets", icon: Lock },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Audit Logs", href: "/settings/audit", icon: FileText },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-hairline bg-canvas p-4 md:block">
        <div className="mb-4">
          <h2 className="text-base font-bold text-ink">Settings</h2>
          <p className="text-xs text-mute">Manage your workspace</p>
        </div>
        <nav className="space-y-0.5">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
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
        </nav>
        <div className="mt-6 flex justify-center opacity-30">
          <MascotPlaceholder size="sm" mood="thinking" />
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
