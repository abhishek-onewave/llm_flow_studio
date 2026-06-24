"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/lib/hooks/use-workspace";
import {
  Settings,
  Key,
  Users,
  CreditCard,
  BarChart3,
  Lock,
  Shield,
  FileText,
  ChevronDown,
  Plus,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SectionId =
  | "workspace"
  | "members"
  | "billing"
  | "usage-limits"
  | "api-keys"
  | "secrets"
  | "security"
  | "audit-logs";

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav items                                                  */
/* ------------------------------------------------------------------ */

const NAV_ITEMS: NavItem[] = [
  { id: "workspace", label: "Workspace", icon: Settings },
  { id: "members", label: "Members", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "usage-limits", label: "Usage limits", icon: BarChart3 },
  { id: "api-keys", label: "API keys", icon: Key },
  { id: "secrets", label: "Secrets", icon: Lock },
  { id: "security", label: "Security", icon: Shield },
  { id: "audit-logs", label: "Audit logs", icon: FileText },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const REGIONS = ["US East (Virginia)", "US West (Oregon)", "EU West (Ireland)", "AP Southeast (Singapore)"] as const;

interface Member {
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  lastActive: string;
  avatar: string;
}

const members: Member[] = [
  { name: "Alex Chen", email: "alex@acme.dev", role: "Owner", lastActive: "Just now", avatar: "AC" },
  { name: "Maria Garcia", email: "maria@acme.dev", role: "Admin", lastActive: "2h ago", avatar: "MG" },
  { name: "James Wilson", email: "james@acme.dev", role: "Editor", lastActive: "1d ago", avatar: "JW" },
  { name: "Sarah Kim", email: "sarah@acme.dev", role: "Viewer", lastActive: "3d ago", avatar: "SK" },
];


/* ------------------------------------------------------------------ */
/*  Shared UI helpers                                                  */
/* ------------------------------------------------------------------ */

function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-semibold text-body">
      {children}
    </label>
  );
}

function FormInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "h-10 w-full rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink lg:h-8",
        "placeholder:text-stone focus:border-accent-blue focus:outline-none",
        mono && "font-mono",
      )}
    />
  );
}

function FormSelect({
  id,
  value,
  onChange,
  options,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-hairline bg-surface-card px-3 pr-8 text-xs text-ink focus:border-accent-blue focus:outline-none lg:h-8"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function SettingsSidebar({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <nav className="hidden w-[240px] shrink-0 flex-col justify-between lg:flex">
      <div className="flex flex-col gap-0.5" role="tablist" aria-label="Settings sections">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-mute">Settings</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-xs transition-colors",
                isActive
                  ? "bg-surface-soft font-semibold text-ink"
                  : "text-body hover:bg-surface-soft/50 hover:text-ink",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Mascot holding a key */}
      <div className="mt-6 flex flex-col items-center px-3 pb-2">
        <MascotPlaceholder size="sm" mood="working" />
        <p className="mt-1 text-[9px] text-mute">Secrets are encrypted at rest.</p>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Workspace                                                 */
/* ------------------------------------------------------------------ */

function WorkspaceSection() {
  const [name, setName] = useState("Acme Engineering");
  const [slug, setSlug] = useState("acme-eng");
  const [region, setRegion] = useState<string>("US East (Virginia)");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-ink">Workspace settings</h2>
        <p className="mt-0.5 text-xs text-mute">Configure your workspace name, slug, and default region.</p>
      </div>

      <div className="rounded-md border border-hairline bg-surface-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="ws-name">Workspace name</FormLabel>
            <FormInput id="ws-name" value={name} onChange={setName} />
          </div>
          <div>
            <FormLabel htmlFor="ws-slug">Slug</FormLabel>
            <FormInput id="ws-slug" value={slug} onChange={setSlug} mono />
            <p className="mt-1 text-[10px] text-mute">
              app.llmflow.studio/<span className="font-mono">{slug}</span>
            </p>
          </div>
          <div className="sm:col-span-2">
            <FormLabel htmlFor="ws-region">Default region</FormLabel>
            <div className="max-w-xs">
              <FormSelect id="ws-region" value={region} onChange={setRegion} options={REGIONS} />
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-hairline-soft pt-4">
          <button className="h-10 rounded-md bg-primary-cta px-4 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed lg:h-auto lg:py-1.5">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Members                                                   */
/* ------------------------------------------------------------------ */

function MembersSection() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Members</h2>
          <p className="mt-0.5 text-xs text-mute">Manage who has access to this workspace.</p>
        </div>
        <button className="inline-flex h-10 items-center gap-1 rounded-md bg-primary-cta px-3 text-[11px] font-bold text-on-primary transition-colors hover:bg-primary-pressed lg:h-7">
          <Plus className="h-3 w-3" />
          Invite member
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-hairline bg-surface-card">
        <table className="w-full min-w-[600px] text-left" aria-label="Members">
          <thead>
            <tr className="border-b border-hairline-soft bg-surface-soft">
              <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Name</th>
              <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Email</th>
              <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Role</th>
              <th scope="col" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-mute">Last active</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-b border-hairline-soft last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-soft text-[9px] font-bold text-mute">
                      {m.avatar}
                    </span>
                    <span className="text-xs font-medium text-ink">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-body">{m.email}</td>
                <td className="px-4 py-2.5">
                  <div className="relative inline-block">
                    <select
                      defaultValue={m.role}
                      className="h-6 appearance-none rounded border border-hairline bg-surface-card px-2 pr-6 text-[10px] font-medium text-ink focus:border-accent-blue focus:outline-none"
                    >
                      {["Owner", "Admin", "Editor", "Viewer"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-mute" />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-xs text-mute">{m.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Usage limits                                              */
/* ------------------------------------------------------------------ */

function UsageLimitsSection() {
  const [budget, setBudget] = useState("500");
  const [maxCost, setMaxCost] = useState("25");
  const [maxParallel, setMaxParallel] = useState("10");
  const [approvalThreshold, setApprovalThreshold] = useState(true);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-ink">Usage limits</h2>
        <p className="mt-0.5 text-xs text-mute">Set spending guardrails and concurrency limits for your workspace.</p>
      </div>

      <div className="rounded-md border border-hairline bg-surface-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="budget">Monthly budget limit</FormLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mute">$</span>
              <input
                id="budget"
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-8 w-full rounded-md border border-hairline bg-surface-card pl-7 pr-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
              />
            </div>
          </div>
          <div>
            <FormLabel htmlFor="max-cost">Max cost per workflow run</FormLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mute">$</span>
              <input
                id="max-cost"
                type="text"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                className="h-8 w-full rounded-md border border-hairline bg-surface-card pl-7 pr-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
              />
            </div>
          </div>
          <div>
            <FormLabel htmlFor="max-parallel">Max parallel runs</FormLabel>
            <FormInput id="max-parallel" value={maxParallel} onChange={setMaxParallel} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={approvalThreshold}
                aria-label="Require approval above cost threshold"
                onClick={() => setApprovalThreshold(!approvalThreshold)}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  approvalThreshold ? "bg-accent-green" : "bg-hairline",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                    approvalThreshold ? "left-[18px]" : "left-0.5",
                  )}
                />
              </button>
              <span className="text-[11px] text-body">Require approval above cost threshold</span>
            </label>
          </div>
        </div>

        <div className="mt-5 border-t border-hairline-soft pt-4">
          <button className="h-10 rounded-md bg-primary-cta px-4 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed lg:h-auto lg:py-1.5">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Secrets                                                   */
/* ------------------------------------------------------------------ */

function SecretsSection() {
  const { workspaceId } = useWorkspace();

  interface ProviderSecret {
    providerId: string;
    providerName: string;
    hasKey: boolean;
  }

  const [providers, setProviders] = useState<ProviderSecret[]>([]);
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: wp } = await supabase
        .from("workspace_providers")
        .select("provider_id, encrypted_api_key, model_providers(name)")
        .eq("workspace_id", workspaceId);

      if (cancelled || !wp) return;

      const list: ProviderSecret[] = (wp as unknown as Array<{
        provider_id: string;
        encrypted_api_key: string;
        model_providers: { name: string } | null;
      }>).map((row) => ({
        providerId: row.provider_id,
        providerName: (row.model_providers as { name: string } | null)?.name ?? row.provider_id,
        hasKey: !!row.encrypted_api_key,
      }));

      setProviders(list);
      setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [workspaceId]);

  async function saveKey(providerId: string) {
    if (!workspaceId) return;
    const key = keyInputs[providerId]?.trim();
    if (!key) return;

    setSaving(providerId);
    const supabase = createClient();
    await supabase
      .from("workspace_providers")
      .update({ encrypted_api_key: key })
      .eq("workspace_id", workspaceId)
      .eq("provider_id", providerId);

    setProviders((prev) =>
      prev.map((p) => (p.providerId === providerId ? { ...p, hasKey: true } : p))
    );
    setKeyInputs((prev) => ({ ...prev, [providerId]: "" }));
    setSaving(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-ink">Secrets</h2>
        <p className="mt-0.5 text-xs text-mute">Manage API keys for your connected providers. Go to Models to connect providers first.</p>
      </div>

      {!loaded ? (
        <p className="text-xs text-mute">Loading...</p>
      ) : providers.length === 0 ? (
        <div className="rounded-md border border-hairline bg-surface-card p-6 text-center">
          <p className="text-xs text-mute">No providers connected. Go to the Models page to connect providers first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p.providerId} className="rounded-md border border-hairline bg-surface-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">{p.providerName}</p>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      p.hasKey ? "bg-accent-green-soft text-accent-green" : "bg-surface-soft text-mute",
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", p.hasKey ? "bg-accent-green" : "bg-ash")} />
                    {p.hasKey ? "Active" : "Not set"}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="password"
                  value={keyInputs[p.providerId] ?? ""}
                  onChange={(e) => setKeyInputs((prev) => ({ ...prev, [p.providerId]: e.target.value }))}
                  placeholder={p.hasKey ? "Enter new key to update..." : "Paste API key..."}
                  className="h-8 flex-1 rounded-md border border-hairline bg-surface-card px-3 font-mono text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none"
                />
                <button
                  onClick={() => saveKey(p.providerId)}
                  disabled={saving === p.providerId || !keyInputs[p.providerId]?.trim()}
                  className={cn(
                    "h-8 rounded-md px-3 text-xs font-bold transition-colors",
                    keyInputs[p.providerId]?.trim()
                      ? "bg-primary-cta text-on-primary hover:bg-primary-pressed"
                      : "cursor-not-allowed bg-surface-soft text-stone",
                  )}
                >
                  {saving === p.providerId ? "Saving..." : p.hasKey ? "Update" : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-3 rounded-md bg-accent-blue-soft px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
        <p className="text-xs leading-relaxed text-ink">
          <span className="font-semibold">API keys are stored in Supabase</span> and retrieved server-side
          when running workflows. Keys are never exposed in browser output.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section: Billing                                                   */
/* ------------------------------------------------------------------ */

function BillingSection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-ink">Billing</h2>
        <p className="mt-0.5 text-xs text-mute">View your current plan, usage, and payment details.</p>
      </div>

      <div className="rounded-md border border-hairline bg-surface-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Current plan */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-mute">Current plan</p>
            <p className="mt-1 text-sm font-bold text-ink">Pro</p>
            <p className="text-xs text-mute">$49/mo &middot; billed monthly</p>
          </div>

          {/* Usage this month */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-mute">Usage this month</p>
            <p className="mt-1 text-sm font-bold text-ink">$127.43</p>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-soft">
              <div className="h-full w-[25%] rounded-full bg-primary-cta" />
            </div>
            <p className="mt-1 text-[10px] text-mute">25% of $500 budget</p>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-mute">Payment method</p>
            <p className="mt-1 text-xs text-ink">Visa ending in 4242</p>
            <button className="mt-1 text-[10px] font-medium text-accent-blue transition-colors hover:underline">
              Update payment method
            </button>
          </div>

          {/* Invoices */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-mute">Invoices</p>
            <button className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-blue transition-colors hover:underline">
              View all invoices
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder section for remaining nav items                        */
/* ------------------------------------------------------------------ */

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-mute">{description}</p>
      </div>
      <div className="flex flex-col items-center rounded-md border border-hairline-soft bg-surface-soft px-6 py-10 text-center">
        <MascotPlaceholder size="sm" mood="thinking" />
        <p className="mt-3 text-xs text-mute">Coming soon</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("workspace");

  const renderContent = () => {
    switch (activeSection) {
      case "workspace":
        return <WorkspaceSection />;
      case "members":
        return <MembersSection />;
      case "billing":
        return <BillingSection />;
      case "usage-limits":
        return <UsageLimitsSection />;
      case "secrets":
        return <SecretsSection />;
      case "api-keys":
        return <PlaceholderSection title="API keys" description="Manage programmatic access to the LLM Flow Studio API." />;
      case "security":
        return <PlaceholderSection title="Security" description="Configure SSO, 2FA, and access policies." />;
      case "audit-logs":
        return <PlaceholderSection title="Audit logs" description="View a history of actions performed in your workspace." />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Settings</p>
        <h1 className="mt-1 text-xl font-bold text-ink">Workspace configuration</h1>
        <p className="mt-1 text-sm text-body">Manage workspace settings, members, billing, and secrets.</p>
      </div>

      {/* Mobile section selector */}
      <div className="mt-4 lg:hidden">
        <div className="-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-3 scrollbar-none" role="tablist" aria-label="Settings sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-ink text-on-dark"
                    : "bg-surface-soft text-body hover:bg-surface-soft/80 hover:text-ink",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shell: sidebar + content */}
      <div className="mt-2 flex gap-6 lg:mt-5">
        <SettingsSidebar active={activeSection} onSelect={setActiveSection} />

        <div className="min-w-0 max-w-[860px] flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
