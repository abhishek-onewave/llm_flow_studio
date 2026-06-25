"use client";

import { useState, useCallback } from "react";
import { OutputRenderer } from "./output-renderer";
import {
  Play,
  Pause,
  Square,
  ChevronRight,
  Copy,
  Maximize2,
  Send,
  Clock,
  Coins,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow/store";
import { runSingleNode, runDownstream, pauseRun, stopRun } from "@/lib/workflow/runner";

/* ------------------------------------------------------------------ */
/*  Mock option lists                                                   */
/* ------------------------------------------------------------------ */

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "mistral", label: "Mistral" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "custom", label: "Custom" },
];

const modelsByProvider: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "o3", label: "o3" },
  ],
  anthropic: [
    { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
    { value: "claude-opus-4", label: "Claude Opus 4" },
    { value: "claude-haiku-3.5", label: "Claude 3.5 Haiku" },
  ],
  google: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  ],
  mistral: [
    { value: "mistral-large", label: "Mistral Large" },
    { value: "mistral-medium", label: "Mistral Medium" },
  ],
  openrouter: [
    { value: "auto", label: "Auto (best available)" },
  ],
  custom: [
    { value: "custom-model", label: "Custom endpoint" },
  ],
};

const variableChips = [
  "{{workflow.input}}",
  "{{previous.output.text}}",
  "{{node.output.json}}",
  "{{file.text}}",
];

const outputFormats = ["Text", "Markdown", "JSON", "Schema"] as const;

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  idle: { bg: "bg-surface-soft", text: "text-mute", label: "Idle" },
  queued: { bg: "bg-accent-blue-soft", text: "text-accent-blue", label: "Queued" },
  running: { bg: "bg-accent-blue-soft", text: "text-accent-blue", label: "Running" },
  completed: { bg: "bg-accent-green-soft", text: "text-accent-green", label: "Completed" },
  error: { bg: "bg-accent-red-soft", text: "text-accent-red", label: "Error" },
  skipped: { bg: "bg-surface-soft", text: "text-mute", label: "Skipped" },
};

/* ------------------------------------------------------------------ */
/*  Mock data for output / logs / inputs                               */
/* ------------------------------------------------------------------ */

const mockUpstreamNodes = [
  { id: "prev-1", label: "Input File", field: "output", connected: true },
  { id: "prev-2", label: "OpenAI Summarizer", field: "output.text", connected: true },
];

const mockInputJson = `{
  "previous.output.text": "Key Terms:\\n1. Payment terms: Net 30\\n2. Liability cap: $500k",
  "workflow.input": "[contract.pdf]"
}`;


/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const tabs = ["Configure", "Prompt", "Inputs", "Output", "Logs"] as const;
type Tab = (typeof tabs)[number];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface NodeInspectorProps {
  selectedNodeId: string | null;
  className?: string;
  onClose?: () => void;
}

export function NodeInspector({ selectedNodeId, className, onClose }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Configure");
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data;

  /* ── Resolved config values (always computed, safe before hooks) ── */

  const config = (data?.config ?? {}) as Record<string, unknown>;
  const provider = (config.provider as string) ?? "";
  const model = (config.model as string) ?? "";
  const instructions = (config.instructions as string) ?? "";
  const promptTemplate = (config.promptTemplate as string) ?? "";
  const temperature = (config.temperature as number) ?? 0.7;
  const maxTokens = (config.maxTokens as number) ?? 4096;
  const timeout = (config.timeout as number) ?? 30;
  const retryCount = (config.retryCount as number) ?? 2;
  const outputFormat = (config.outputFormat as string) ?? "text";
  const status = data?.status ?? "idle";
  const chip = statusStyles[status] ?? statusStyles.idle;
  const isLLM = !!provider;

  /* ── Update helpers (hooks must be called unconditionally) ──────── */

  const configRef = JSON.stringify(config);
  const updateConfig = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedNodeId) return;
      const current = JSON.parse(configRef) as Record<string, unknown>;
      updateNode(selectedNodeId, { config: { ...current, ...patch } } as Record<string, unknown>);
    },
    [selectedNodeId, configRef, updateNode]
  );

  const updateLabel = useCallback(
    (label: string) => {
      if (!selectedNodeId) return;
      updateNode(selectedNodeId, { label });
    },
    [selectedNodeId, updateNode]
  );

  /* ── Empty state ────────────────────────────────────────────────── */

  if (!selectedNodeId || !data) {
    return (
      <div className={className ?? "hidden w-72 shrink-0 flex-col items-center justify-center border-l border-hairline bg-surface-card p-6 lg:flex"}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink lg:hidden"
            aria-label="Close inspector"
          >
            <X size={14} />
          </button>
        )}
        <p className="text-xs text-mute">Select a node to inspect</p>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className={className ?? "hidden w-72 shrink-0 flex-col border-l border-hairline bg-surface-card lg:flex"}>
      {/* Header */}
      <div className="border-b border-hairline-soft px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.bg} ${chip.text}`}>
              {chip.label}
            </span>
            <p className="truncate text-xs font-bold text-ink">{data.label}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink lg:hidden"
              aria-label="Close inspector"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-mute">
          {isLLM ? `${provider} · ${model}` : data.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline-soft" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              "flex-1 py-2 text-center text-[11px] font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-ink text-ink"
                : "text-mute hover:text-body"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
        {activeTab === "Configure" && (
          <ConfigurePanel
            label={data.label}
            colorKey={data.colorKey}
            provider={provider}
            model={model}
            status={status}
            temperature={temperature}
            maxTokens={maxTokens}
            timeout={timeout}
            retryCount={retryCount}
            isLLM={isLLM}
            onLabelChange={updateLabel}
            onConfigChange={updateConfig}
          />
        )}
        {activeTab === "Prompt" && (
          <PromptPanel
            instructions={instructions}
            promptTemplate={promptTemplate}
            isLLM={isLLM}
            onConfigChange={updateConfig}
          />
        )}
        {activeTab === "Inputs" && <InputsPanel />}
        {activeTab === "Output" && (
          <OutputPanel outputFormat={outputFormat} onConfigChange={updateConfig} nodeId={selectedNodeId} />
        )}
        {activeTab === "Logs" && <LogsPanel nodeId={selectedNodeId} />}
      </div>

      {/* Bottom actions */}
      <InspectorActions selectedNodeId={selectedNodeId} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Configure panel                                                    */
/* ------------------------------------------------------------------ */

interface ConfigurePanelProps {
  label: string;
  colorKey: string;
  provider: string;
  model: string;
  status: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retryCount: number;
  isLLM: boolean;
  onLabelChange: (v: string) => void;
  onConfigChange: (patch: Record<string, unknown>) => void;
}

function ConfigurePanel({
  label,
  colorKey,
  provider,
  model,
  status,
  temperature,
  maxTokens,
  timeout,
  retryCount,
  isLLM,
  onLabelChange,
  onConfigChange,
}: ConfigurePanelProps) {
  const chip = statusStyles[status] ?? statusStyles.idle;
  const models = modelsByProvider[provider] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <Field label="Node Label" htmlFor="inspector-node-label">
        <input
          id="inspector-node-label"
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
        />
      </Field>

      {/* Node type */}
      <Field label="Node Type">
        <div className="flex h-8 items-center rounded-md border border-hairline bg-canvas px-3 text-xs text-body">
          {colorKey}
        </div>
      </Field>

      {/* Status */}
      <Field label="Status">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.bg} ${chip.text}`}>
          {chip.label}
        </span>
      </Field>

      {isLLM && (
        <>
          {/* Provider */}
          <Field label="Provider" htmlFor="inspector-provider">
            <select
              id="inspector-provider"
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value;
                const firstModel = modelsByProvider[newProvider]?.[0]?.value ?? "";
                onConfigChange({ provider: newProvider, model: firstModel });
              }}
              className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-2 text-xs text-ink focus:border-accent-blue focus:outline-none"
            >
              {providerOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          {/* Model */}
          <Field label="Model" htmlFor="inspector-model">
            <select
              id="inspector-model"
              value={model}
              onChange={(e) => onConfigChange({ model: e.target.value })}
              className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-2 text-xs text-ink focus:border-accent-blue focus:outline-none"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>

          {/* Temperature */}
          <Field label="Temperature" htmlFor="inspector-temperature">
            <div className="flex items-center gap-2">
              <input
                id="inspector-temperature"
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => onConfigChange({ temperature: parseFloat(e.target.value) })}
                aria-label="Temperature"
                aria-valuemin={0}
                aria-valuemax={2}
                aria-valuenow={temperature}
                className="h-1.5 flex-1 appearance-none rounded-full bg-surface-soft accent-primary-cta"
              />
              <span className="w-8 text-right text-[11px] font-medium text-ink">
                {temperature.toFixed(1)}
              </span>
            </div>
          </Field>

          {/* Max tokens */}
          <Field label="Max Output Tokens" htmlFor="inspector-max-tokens">
            <input
              id="inspector-max-tokens"
              type="number"
              value={maxTokens}
              onChange={(e) => onConfigChange({ maxTokens: parseInt(e.target.value) || 4096 })}
              className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
            />
          </Field>

          {/* Timeout */}
          <Field label="Timeout (seconds)" htmlFor="inspector-timeout">
            <input
              id="inspector-timeout"
              type="number"
              value={timeout}
              onChange={(e) => onConfigChange({ timeout: parseInt(e.target.value) || 30 })}
              className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
            />
          </Field>

          {/* Retry count */}
          <Field label="Retry Count" htmlFor="inspector-retry-count">
            <input
              id="inspector-retry-count"
              type="number"
              min={0}
              max={5}
              value={retryCount}
              onChange={(e) => onConfigChange({ retryCount: parseInt(e.target.value) || 0 })}
              className="flex h-8 w-full items-center rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink focus:border-accent-blue focus:outline-none"
            />
          </Field>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Prompt panel                                                       */
/* ------------------------------------------------------------------ */

interface PromptPanelProps {
  instructions: string;
  promptTemplate: string;
  isLLM: boolean;
  onConfigChange: (patch: Record<string, unknown>) => void;
}

function PromptPanel({ instructions, promptTemplate, isLLM, onConfigChange }: PromptPanelProps) {
  if (!isLLM) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-xs text-mute">Prompt configuration is only available for LLM nodes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* System instructions */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-mute">System Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => onConfigChange({ instructions: e.target.value })}
          placeholder="You are a helpful assistant..."
          className="h-24 w-full resize-none rounded-md border border-hairline bg-surface-card px-3 py-2 font-mono text-xs text-body placeholder:text-stone focus:border-accent-blue focus:outline-none"
        />
      </div>

      {/* Prompt template — dark code block */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[11px] font-medium text-mute">Prompt Template</label>
          <div className="flex items-center gap-1">
            <button aria-label="Copy output" className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
              <Copy size={11} />
            </button>
            <button aria-label="Expand output" className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
              <Maximize2 size={11} />
            </button>
          </div>
        </div>
        <textarea
          value={promptTemplate}
          onChange={(e) => onConfigChange({ promptTemplate: e.target.value })}
          placeholder="Enter your prompt template..."
          className="h-32 w-full resize-none rounded-md bg-surface-dark px-4 py-3 font-mono text-xs leading-relaxed text-on-dark placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
      </div>

      {/* Variable chips */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-mute">Available Variables</label>
        <div className="flex flex-wrap gap-1.5">
          {variableChips.map((v) => (
            <button
              key={v}
              onClick={() => onConfigChange({ promptTemplate: promptTemplate + " " + v })}
              className="inline-flex items-center rounded-md bg-surface-soft px-2 py-1 font-mono text-[10px] font-medium text-body transition-colors hover:bg-hairline-soft hover:text-ink"
            >
              {v}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-mute">
          Click a variable to insert it into the prompt template.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inputs panel                                                       */
/* ------------------------------------------------------------------ */

function InputsPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Upstream nodes */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-mute">Upstream Nodes</label>
        <div className="flex flex-col gap-1.5">
          {mockUpstreamNodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between rounded-md border border-hairline-soft p-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-ink">{node.label}</p>
                <p className="text-[10px] text-mute">{node.field}</p>
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                node.connected ? "text-accent-green" : "text-mute"
              )}>
                {node.connected ? "connected" : "disconnected"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Input mapping */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-mute">Input Mapping Preview</label>
        <div className="rounded-md bg-surface-dark px-3 py-2.5">
          <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-on-dark">
            {mockInputJson}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Output panel                                                       */
/* ------------------------------------------------------------------ */

interface OutputPanelProps {
  outputFormat: string;
  onConfigChange: (patch: Record<string, unknown>) => void;
  nodeId: string;
}

function OutputPanel({ outputFormat, onConfigChange, nodeId }: OutputPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const nodeOutputs = useWorkflowStore((s) => s.nodeOutputs);
  const liveOutput = nodeOutputs[nodeId] ?? "";

  return (
    <div className="flex flex-col gap-4">
      {/* Format segmented control */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-mute">Output Format</label>
        <div className="flex gap-1">
          {outputFormats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onConfigChange({ outputFormat: fmt.toLowerCase() })}
              className={cn(
                "flex-1 rounded-md py-1 text-[11px] font-medium transition-colors",
                outputFormat === fmt.toLowerCase()
                  ? "bg-ink text-on-dark"
                  : "bg-surface-soft text-body hover:text-ink"
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Current output */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[11px] font-medium text-mute">Last Output</label>
          {liveOutput && (
            <span className="inline-flex items-center rounded-full bg-accent-green-soft px-2 py-0.5 text-[10px] font-semibold text-accent-green">
              {liveOutput.length > 0 ? "Streaming" : "Waiting"}
            </span>
          )}
        </div>
        <div className="rounded-md bg-surface-dark px-4 py-3 max-h-64 overflow-y-auto">
          <OutputRenderer output={liveOutput} />
        </div>
      </div>

      {/* Chat with output */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-mute">Chat with Output</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about this output..."
            aria-label="Chat with node output"
            className="flex h-8 flex-1 items-center rounded-md border border-hairline bg-surface-card px-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none"
          />
          <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-cta text-on-primary transition-colors hover:bg-primary-pressed">
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logs panel                                                         */
/* ------------------------------------------------------------------ */

function LogsPanel({ nodeId }: { nodeId: string }) {
  const runEvents = useWorkflowStore((s) => s.runEvents);
  const nodeEvents = runEvents.filter((e) => e.nodeId === nodeId);

  return (
    <div className="flex flex-col gap-4">
      {/* Events */}
      <div>
        <label className="mb-1.5 block text-[11px] font-medium text-mute">Node Events</label>
        <div className="flex flex-col gap-1 text-[11px]">
          {nodeEvents.length === 0 ? (
            <p className="text-mute">No events yet for this node.</p>
          ) : (
            nodeEvents.map((ev) => (
              <div key={ev.id} className="flex gap-2">
                <span className="shrink-0 font-mono text-mute">{ev.timestamp}</span>
                <span
                  className={cn(
                    ev.type === "completed" && "text-accent-green",
                    ev.type === "error" && "text-accent-red",
                    ev.type === "skipped" && "text-mute",
                    (ev.type === "started" || ev.type === "output_chunk") && "text-body",
                  )}
                >
                  {ev.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-mute">Execution Stats</label>
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Coins size={12} />} label="Tokens" value="7,100" />
          <StatCard icon={<Clock size={12} />} label="Duration" value="8.4s" />
          <StatCard icon={<Coins size={12} />} label="Cost" value="$0.12" />
          <StatCard icon={<AlertTriangle size={12} />} label="Retries" value="0" />
        </div>
      </div>

      {/* Error placeholder */}
      <div className="rounded-md border border-dashed border-hairline-soft p-3">
        <p className="text-center text-[11px] text-mute">No errors in last run</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inspector actions                                                  */
/* ------------------------------------------------------------------ */

function InspectorActions({ selectedNodeId }: { selectedNodeId: string }) {
  const runStatus = useWorkflowStore((s) => s.runStatus);
  const isBusy = runStatus === "running" || runStatus === "queued";

  return (
    <div className="border-t border-hairline-soft p-3">
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => runSingleNode(selectedNodeId)}
          disabled={isBusy}
          className={cn(
            "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-colors",
            isBusy
              ? "cursor-not-allowed bg-surface-soft text-stone"
              : "bg-primary-cta text-on-primary hover:bg-primary-pressed"
          )}
        >
          <Play size={14} />
          Run node
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={pauseRun}
            disabled={runStatus !== "running"}
            className={cn(
              "inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-hairline text-[11px] font-medium transition-colors",
              runStatus === "running"
                ? "text-body hover:bg-surface-soft hover:text-ink"
                : "cursor-not-allowed text-stone"
            )}
          >
            <Pause size={12} />
            Pause after
          </button>
          <button
            onClick={stopRun}
            disabled={!isBusy}
            className={cn(
              "inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-hairline text-[11px] font-medium transition-colors",
              isBusy
                ? "text-accent-red hover:bg-accent-red-soft"
                : "cursor-not-allowed text-stone"
            )}
          >
            <Square size={12} />
            Stop
          </button>
        </div>
        <button
          onClick={() => runDownstream(selectedNodeId)}
          disabled={isBusy}
          className={cn(
            "inline-flex h-7 w-full items-center justify-center gap-1 rounded-md border border-hairline text-[11px] font-medium transition-colors",
            isBusy
              ? "cursor-not-allowed text-stone"
              : "text-body hover:bg-surface-soft hover:text-ink"
          )}
        >
          <ChevronRight size={12} />
          Continue downstream
        </button>
      </div>

      {/* Mascot placeholder */}
      <div className="mt-3 flex items-center justify-center">
        <span className="text-[10px] text-stone">
          {"\u{1F994}"} hedgehog says: looking good!
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared subcomponents                                               */
/* ------------------------------------------------------------------ */

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-medium text-mute">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-hairline-soft p-2">
      <span className="text-mute">{icon}</span>
      <div>
        <p className="text-[10px] text-mute">{label}</p>
        <p className="text-xs font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
