"use client";

import { useState, useEffect, useReducer } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  Cpu,
  Boxes,
  Settings,
  Check,
  Star,
  ChevronDown,
  RefreshCw,
  Plus,
  Eye,
  Wrench,
  Brain,
  Type,
  ShieldAlert,
  ToggleLeft,
  Ban,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEMO_WORKSPACE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProviderRow {
  id: string;
  name: string;
  description: string;
  icon_slug: string;
  website: string;
}

interface ModelRow {
  id: string;
  provider_id: string;
  name: string;
  display_name: string;
  description: string;
  context_window: number;
  max_output: number;
  input_price_per_1k: number;
  output_price_per_1k: number;
  capabilities: string[];
  status: string;
}

interface WorkspaceProviderRow {
  provider_id: string;
  is_enabled: boolean;
}

/* ------------------------------------------------------------------ */
/*  Icon / color maps                                                  */
/* ------------------------------------------------------------------ */

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: Bot, anthropic: Sparkles, google: Zap, mistral: Cpu, openrouter: Boxes, custom: Settings,
};
const providerColors: Record<string, string> = {
  openai: "#2c8c66", anthropic: "#7c44a6", google: "#2c84e0", mistral: "#cd4239", openrouter: "#6c6e63", custom: "#6c6e63",
};

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

function CapChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
      active ? "bg-accent-green-soft text-accent-green" : "bg-surface-soft text-stone",
    )}>
      {active ? <Check className="h-2 w-2" /> : null}
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatContext(ctx: number): string {
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(0)}M`;
  if (ctx >= 1_000) return `${(ctx / 1_000).toFixed(0)}K`;
  return String(ctx);
}

function formatPrice(price: number): string {
  if (price === 0) return "$0";
  if (price < 0.001) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ModelsPage() {
  const [refreshKey, refresh] = useReducer((x: number) => x + 1, 0);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [defaultModelId, setDefaultModelId] = useState<string>("");
  const [budget, setBudget] = useState("500");
  const [requireApproval, setRequireApproval] = useState(false);
  const [disableDeprecated, setDisableDeprecated] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch providers, models, and workspace connection state
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const [provRes, modRes, wpRes] = await Promise.all([
        supabase.from("model_providers").select("*").order("name"),
        supabase.from("models").select("*").order("provider_id, display_name"),
        supabase
          .from("workspace_providers")
          .select("provider_id, is_enabled")
          .eq("workspace_id", DEMO_WORKSPACE_ID),
      ]);

      if (cancelled) return;

      if (provRes.data) setProviders(provRes.data as ProviderRow[]);
      if (modRes.data) {
        const mods = modRes.data as ModelRow[];
        setModels(mods);
        setDefaultModelId((prev) => prev || mods[0]?.id || "");
      }
      if (wpRes.data) {
        const map: Record<string, boolean> = {};
        (wpRes.data as WorkspaceProviderRow[]).forEach((row) => {
          map[row.provider_id] = row.is_enabled;
        });
        setConnectedMap(map);
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Toggle provider connection
  const toggleProvider = async (providerId: string) => {
    setTogglingId(providerId);
    const supabase = createClient();
    const currentlyEnabled = connectedMap[providerId] ?? false;
    const newEnabled = !currentlyEnabled;

    if (currentlyEnabled) {
      // Disable: delete the row
      await supabase
        .from("workspace_providers")
        .delete()
        .eq("workspace_id", DEMO_WORKSPACE_ID)
        .eq("provider_id", providerId);
    } else {
      // Enable: upsert
      await supabase.from("workspace_providers").upsert(
        {
          workspace_id: DEMO_WORKSPACE_ID,
          provider_id: providerId,
          is_enabled: true,
          api_key_set: false,
        },
        { onConflict: "workspace_id,provider_id" },
      );
    }

    setConnectedMap((prev) => {
      const next = { ...prev };
      if (newEnabled) {
        next[providerId] = true;
      } else {
        delete next[providerId];
      }
      return next;
    });
    setTogglingId(null);
  };

  const activeModels = models.filter((m) => m.status === "active");
  const deprecatedModels = models.filter((m) => m.status === "deprecated");
  const connectedCount = Object.keys(connectedMap).length;

  const hasCapability = (m: ModelRow, cap: string) => m.capabilities.includes(cap);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin text-mute" />
        <span className="ml-2 text-sm text-mute">Loading models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Models</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Connect every model your workflows need.</h1>
          <p className="mt-1 text-sm text-body">
            Configure providers, manage model access, and set usage policies across your workspace.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => { setLoading(true); refresh(); }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink sm:h-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync model registry
          </button>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8">
            <Plus className="h-3.5 w-3.5" />
            Connect provider
          </button>
        </div>
      </div>

      {/* ---- Providers + Sync status ---- */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Connected providers */}
        <div className="rounded-md border border-hairline bg-surface-card">
          <div className="border-b border-hairline-soft px-4 py-2.5">
            <h2 className="text-xs font-semibold text-ink">Connected Providers</h2>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-3">
            {providers.map((p, i) => {
              const Icon = providerIcons[p.icon_slug] ?? Bot;
              const color = providerColors[p.icon_slug] ?? "#6c6e63";
              const isConnected = connectedMap[p.id] ?? false;
              const isToggling = togglingId === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i < providers.length - 3 && "border-b border-hairline-soft",
                    (i % 3 !== 2) && "border-r border-hairline-soft",
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: color }}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink">{p.name}</p>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-accent-green">
                        <Check className="h-2.5 w-2.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-mute">Not connected</span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleProvider(p.id)}
                    disabled={isToggling}
                    className={cn(
                      "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                      isConnected ? "bg-accent-green" : "bg-hairline",
                      isToggling && "opacity-50",
                    )}
                    role="switch"
                    aria-checked={isConnected}
                    aria-label={`Toggle ${p.name}`}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                      isConnected ? "left-[18px]" : "left-0.5",
                    )} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync status card */}
        <div className="rounded-md border border-hairline bg-surface-card">
          <div className="border-b border-hairline-soft px-4 py-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-ink">Sync Status</h2>
              <MascotPlaceholder size="sm" mood="working" className="h-8 w-8" />
            </div>
          </div>
          <div className="divide-y divide-hairline-soft">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">Last sync</span>
              <span className="font-mono text-[11px] text-body">Just now</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">Active models</span>
              <span className="font-mono text-[11px] font-semibold text-ink">{activeModels.length}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">Deprecated</span>
              <span className="font-mono text-[11px] text-accent-red">{deprecatedModels.length}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">Providers connected</span>
              <span className="font-mono text-[11px] font-semibold text-ink">{connectedCount}/{providers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Model table ---- */}
      <div className="rounded-md border border-hairline bg-surface-card">
        <div className="border-b border-hairline-soft px-4 py-2.5">
          <h2 className="text-xs font-semibold text-ink">Model Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]" aria-label="Model registry">
            <thead>
              <tr className="border-b border-hairline-soft bg-surface-soft/50">
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Model</th>
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Provider</th>
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Context</th>
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Input</th>
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Output</th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute"><Type className="mx-auto h-3 w-3" aria-hidden="true" /><span className="sr-only">Text</span></th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute"><Eye className="mx-auto h-3 w-3" aria-hidden="true" /><span className="sr-only">Vision</span></th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute"><Wrench className="mx-auto h-3 w-3" aria-hidden="true" /><span className="sr-only">Tools</span></th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute"><Brain className="mx-auto h-3 w-3" aria-hidden="true" /><span className="sr-only">Reasoning</span></th>
                <th scope="col" className="px-4 py-2.5 font-medium text-mute">Status</th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute">Allowed</th>
                <th scope="col" className="px-4 py-2.5 text-center font-medium text-mute">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {models.map((m) => {
                const providerConnected = connectedMap[m.provider_id] ?? false;
                return (
                  <tr key={m.id} className={cn("transition-colors hover:bg-surface-soft/30", m.status === "deprecated" && "opacity-60")}>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{m.display_name}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-body">
                      {providers.find((p) => p.id === m.provider_id)?.name ?? m.provider_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{formatContext(m.context_window)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{formatPrice(m.input_price_per_1k)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{formatPrice(m.output_price_per_1k)}</td>
                    <td className="px-4 py-2.5 text-center"><CapChip label="Text" active={hasCapability(m, "text")} /></td>
                    <td className="px-4 py-2.5 text-center"><CapChip label="Vision" active={hasCapability(m, "vision")} /></td>
                    <td className="px-4 py-2.5 text-center"><CapChip label="Tools" active={hasCapability(m, "function_calling")} /></td>
                    <td className="px-4 py-2.5 text-center"><CapChip label="Reasoning" active={hasCapability(m, "streaming")} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        m.status === "active" ? "bg-accent-green-soft text-accent-green" : "bg-accent-red-soft text-accent-red",
                      )}>
                        {m.status === "active" ? "Active" : "Deprecated"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {providerConnected ? (
                        <Check className="mx-auto h-3.5 w-3.5 text-accent-green" />
                      ) : (
                        <Ban className="mx-auto h-3.5 w-3.5 text-stone" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => setDefaultModelId(m.id)} title={m.id === defaultModelId ? "Default model" : "Set as default"}>
                        <Star className={cn("h-3.5 w-3.5 transition-colors", m.id === defaultModelId ? "fill-primary-cta text-primary-cta" : "text-hairline hover:text-primary-cta")} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Model Policy ---- */}
      <div className="rounded-md border border-hairline bg-surface-card">
        <div className="border-b border-hairline-soft px-4 py-2.5">
          <h2 className="text-xs font-semibold text-ink">Model Policy</h2>
        </div>
        <div className="max-w-lg space-y-5 p-5">
          {/* Default model */}
          <div>
            <label id="default-model-label" className="block text-xs font-medium text-ink">Default Model</label>
            <div className="relative mt-1.5">
              <button type="button" aria-label="Default model" aria-expanded={dropdownOpen} onClick={() => setDropdownOpen(!dropdownOpen)} className="flex w-full items-center justify-between rounded-md border border-hairline bg-white px-3 py-2 text-xs text-ink transition-colors hover:border-mute">
                <span>{models.find((m) => m.id === defaultModelId)?.display_name ?? "Select"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-mute" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-hairline bg-surface-card">
                  {activeModels.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setDefaultModelId(m.id); setDropdownOpen(false); }} className={cn("w-full px-3 py-2 text-left text-xs transition-colors hover:bg-surface-soft", m.id === defaultModelId ? "font-medium text-ink bg-surface-soft/50" : "text-body")}>
                      {m.display_name} <span className="text-[10px] text-mute">({providers.find((p) => p.id === m.provider_id)?.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly budget */}
          <div>
            <label htmlFor="models-monthly-budget" className="block text-xs font-medium text-ink">Monthly Budget</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mute">$</span>
              <input id="models-monthly-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-md border border-hairline bg-white py-2 pl-7 pr-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none" placeholder="500" min={0} />
            </div>
            <p className="mt-1 text-[10px] text-mute">Monthly spending cap across all providers.</p>
          </div>

          {/* Require approval */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-mute" />
              <div>
                <p className="text-xs font-medium text-ink">Require approval for expensive models</p>
                <p className="text-[10px] text-mute">Models costing &gt;$10/1K tokens need admin approval.</p>
              </div>
            </div>
            <button role="switch" aria-checked={requireApproval} aria-label="Require approval for expensive models" onClick={() => setRequireApproval(!requireApproval)} className={cn("relative h-5 w-9 rounded-full transition-colors", requireApproval ? "bg-accent-green" : "bg-hairline")}>
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", requireApproval ? "left-[18px]" : "left-0.5")} />
            </button>
          </div>

          {/* Disable deprecated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-3.5 w-3.5 text-mute" />
              <div>
                <p className="text-xs font-medium text-ink">Disable deprecated models</p>
                <p className="text-[10px] text-mute">Prevent workflows from using deprecated models.</p>
              </div>
            </div>
            <button role="switch" aria-checked={disableDeprecated} aria-label="Disable deprecated models" onClick={() => setDisableDeprecated(!disableDeprecated)} className={cn("relative h-5 w-9 rounded-full transition-colors", disableDeprecated ? "bg-accent-green" : "bg-hairline")}>
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", disableDeprecated ? "left-[18px]" : "left-0.5")} />
            </button>
          </div>

          <button className="rounded-md bg-primary-cta px-4 py-2 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed">
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
}
