"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";

/* ------------------------------------------------------------------ */
/*  Mock data (generic names per spec)                                 */
/* ------------------------------------------------------------------ */

interface Provider {
  id: string;
  name: string;
  description: string;
  iconSlug: string;
  connected: boolean;
  modelCount: number;
}

const providers: Provider[] = [
  { id: "openai", name: "OpenAI", description: "Chat, reasoning, and embedding models", iconSlug: "openai", connected: true, modelCount: 4 },
  { id: "anthropic", name: "Anthropic", description: "Claude reasoning and assistant models", iconSlug: "anthropic", connected: true, modelCount: 3 },
  { id: "google", name: "Google Gemini", description: "Multimodal and Flash models", iconSlug: "google", connected: true, modelCount: 2 },
  { id: "mistral", name: "Mistral", description: "European open-weight models", iconSlug: "mistral", connected: false, modelCount: 0 },
  { id: "openrouter", name: "OpenRouter", description: "Unified API for 100+ models", iconSlug: "openrouter", connected: true, modelCount: 0 },
  { id: "custom", name: "Custom Endpoint", description: "OpenAI-compatible endpoint", iconSlug: "custom", connected: false, modelCount: 0 },
];

interface MockModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  inputPrice: string;
  outputPrice: string;
  hasTools: boolean;
  hasVision: boolean;
  hasText: boolean;
  hasJson: boolean;
  hasReasoning: boolean;
  status: "active" | "deprecated";
  allowed: boolean;
  isDefault: boolean;
}

const models: MockModel[] = [
  { id: "m1", name: "Latest OpenAI chat model", provider: "OpenAI", contextWindow: "128K", inputPrice: "$2.50", outputPrice: "$10.00", hasTools: true, hasVision: true, hasText: true, hasJson: true, hasReasoning: false, status: "active", allowed: true, isDefault: true },
  { id: "m2", name: "OpenAI fast chat model", provider: "OpenAI", contextWindow: "128K", inputPrice: "$0.15", outputPrice: "$0.60", hasTools: true, hasVision: true, hasText: true, hasJson: true, hasReasoning: false, status: "active", allowed: true, isDefault: false },
  { id: "m3", name: "OpenAI reasoning model", provider: "OpenAI", contextWindow: "200K", inputPrice: "$10.00", outputPrice: "$40.00", hasTools: true, hasVision: false, hasText: true, hasJson: false, hasReasoning: true, status: "active", allowed: true, isDefault: false },
  { id: "m4", name: "OpenAI fast reasoning model", provider: "OpenAI", contextWindow: "200K", inputPrice: "$1.10", outputPrice: "$4.40", hasTools: true, hasVision: false, hasText: true, hasJson: false, hasReasoning: true, status: "active", allowed: true, isDefault: false },
  { id: "m5", name: "Latest Claude reasoning model", provider: "Anthropic", contextWindow: "200K", inputPrice: "$15.00", outputPrice: "$75.00", hasTools: true, hasVision: true, hasText: true, hasJson: false, hasReasoning: true, status: "active", allowed: true, isDefault: false },
  { id: "m6", name: "Claude balanced model", provider: "Anthropic", contextWindow: "200K", inputPrice: "$3.00", outputPrice: "$15.00", hasTools: true, hasVision: true, hasText: true, hasJson: false, hasReasoning: false, status: "active", allowed: true, isDefault: false },
  { id: "m7", name: "Claude fast model", provider: "Anthropic", contextWindow: "200K", inputPrice: "$0.80", outputPrice: "$4.00", hasTools: true, hasVision: true, hasText: true, hasJson: false, hasReasoning: false, status: "active", allowed: true, isDefault: false },
  { id: "m8", name: "Latest Gemini multimodal model", provider: "Google Gemini", contextWindow: "1M", inputPrice: "$1.25", outputPrice: "$10.00", hasTools: true, hasVision: true, hasText: true, hasJson: true, hasReasoning: true, status: "active", allowed: true, isDefault: false },
  { id: "m9", name: "Gemini fast model", provider: "Google Gemini", contextWindow: "1M", inputPrice: "$0.15", outputPrice: "$0.60", hasTools: true, hasVision: true, hasText: true, hasJson: true, hasReasoning: false, status: "active", allowed: true, isDefault: false },
  { id: "m10", name: "Mistral large model", provider: "Mistral", contextWindow: "128K", inputPrice: "$2.00", outputPrice: "$6.00", hasTools: true, hasVision: false, hasText: true, hasJson: true, hasReasoning: false, status: "active", allowed: false, isDefault: false },
  { id: "m11", name: "OpenRouter aggregated model", provider: "OpenRouter", contextWindow: "128K", inputPrice: "varies", outputPrice: "varies", hasTools: true, hasVision: false, hasText: true, hasJson: false, hasReasoning: false, status: "active", allowed: true, isDefault: false },
  { id: "m12", name: "Legacy OpenAI chat model", provider: "OpenAI", contextWindow: "8K", inputPrice: "$30.00", outputPrice: "$60.00", hasTools: true, hasVision: false, hasText: true, hasJson: false, hasReasoning: false, status: "deprecated", allowed: false, isDefault: false },
];

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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ModelsPage() {
  const [defaultModelId, setDefaultModelId] = useState(() => models.find((m) => m.isDefault)?.id ?? models[0].id);
  const [budget, setBudget] = useState("500");
  const [requireApproval, setRequireApproval] = useState(false);
  const [disableDeprecated, setDisableDeprecated] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeModels = models.filter((m) => m.status === "active");
  const deprecatedModels = models.filter((m) => m.status === "deprecated");
  const connectedCount = providers.filter((p) => p.connected).length;

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
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink sm:h-8">
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
              const Icon = providerIcons[p.iconSlug] ?? Bot;
              const color = providerColors[p.iconSlug] ?? "#6c6e63";
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
                    {p.connected ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-accent-green">
                        <Check className="h-2.5 w-2.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-mute">Not connected</span>
                    )}
                  </div>
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
              <span className="font-mono text-[11px] text-body">2 min ago</span>
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
              {models.map((m) => (
                <tr key={m.id} className={cn("transition-colors hover:bg-surface-soft/30", m.status === "deprecated" && "opacity-60")}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{m.name}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-body">{m.provider}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{m.contextWindow}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{m.inputPrice}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">{m.outputPrice}</td>
                  <td className="px-4 py-2.5 text-center"><CapChip label="Text" active={m.hasText} /></td>
                  <td className="px-4 py-2.5 text-center"><CapChip label="Vision" active={m.hasVision} /></td>
                  <td className="px-4 py-2.5 text-center"><CapChip label="Tools" active={m.hasTools} /></td>
                  <td className="px-4 py-2.5 text-center"><CapChip label="Reasoning" active={m.hasReasoning} /></td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      m.status === "active" ? "bg-accent-green-soft text-accent-green" : "bg-accent-red-soft text-accent-red",
                    )}>
                      {m.status === "active" ? "Active" : "Deprecated"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {m.allowed ? (
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
              ))}
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
                <span>{models.find((m) => m.id === defaultModelId)?.name ?? "Select"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-mute" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-hairline bg-surface-card">
                  {activeModels.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setDefaultModelId(m.id); setDropdownOpen(false); }} className={cn("w-full px-3 py-2 text-left text-xs transition-colors hover:bg-surface-soft", m.id === defaultModelId ? "font-medium text-ink bg-surface-soft/50" : "text-body")}>
                      {m.name} <span className="text-[10px] text-mute">({m.provider})</span>
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
