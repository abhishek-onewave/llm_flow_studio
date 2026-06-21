"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Hash,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  ChevronRight,
  Play,
  Pause,
  Square,
  Download,
  Activity,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockRuns } from "@/lib/mock/runs";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import type { NodeRun, RunEvent, WorkflowRun } from "@/types/runs";
import type { NodeStatus } from "@/types/workflow";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDuration(ms: number | null): string {
  if (ms === null) return "--";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}

const statusConfig: Record<
  NodeStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  completed: { label: "Completed", color: "text-accent-green", bg: "bg-accent-green-soft", icon: CheckCircle2 },
  error: { label: "Error", color: "text-accent-red", bg: "bg-accent-red-soft", icon: XCircle },
  running: { label: "Running", color: "text-accent-blue", bg: "bg-accent-blue-soft", icon: Loader2 },
  skipped: { label: "Skipped", color: "text-mute", bg: "bg-surface-soft", icon: MinusCircle },
  idle: { label: "Idle", color: "text-mute", bg: "bg-surface-soft", icon: MinusCircle },
  queued: { label: "Queued", color: "text-mute", bg: "bg-surface-soft", icon: Loader2 },
};

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: NodeStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", cfg.bg, cfg.color)}>
      <Icon className={cn("h-3 w-3", status === "running" && "animate-spin")} />
      {cfg.label}
    </span>
  );
}

function NodeStatusIcon({ status }: { status: NodeStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return <Icon className={cn("h-4 w-4 shrink-0", cfg.color, status === "running" && "animate-spin")} />;
}

/* ------------------------------------------------------------------ */
/*  1  Summary metric cards                                            */
/* ------------------------------------------------------------------ */

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card p-4">
      <div className="flex items-center gap-2 text-mute">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 font-mono text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2  DAG preview  — horizontal execution sequence                    */
/* ------------------------------------------------------------------ */

function DagPreview({ nodeRuns, selectedNodeId, onSelectNode }: {
  nodeRuns: NodeRun[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      <div className="border-b border-hairline-soft px-4 py-2.5">
        <h3 className="text-xs font-semibold text-ink">Execution Sequence</h3>
      </div>
      <div className="flex items-center gap-0 overflow-x-auto px-4 py-4">
        {nodeRuns.map((node, i) => {
          const cfg = statusConfig[node.status];
          return (
            <React.Fragment key={node.nodeId}>
              <button
                onClick={() => onSelectNode(node.nodeId)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-md px-3 py-3 transition-colors sm:py-2",
                  selectedNodeId === node.nodeId ? "bg-surface-soft" : "hover:bg-surface-soft/50",
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border",
                  node.status === "completed" && "border-accent-green/30 bg-accent-green-soft",
                  node.status === "error" && "border-accent-red/30 bg-accent-red-soft",
                  node.status === "running" && "border-accent-blue/30 bg-accent-blue-soft",
                  (node.status === "queued" || node.status === "idle" || node.status === "skipped") && "border-hairline bg-surface-soft",
                )}>
                  <NodeStatusIcon status={node.status} />
                </div>
                <span className="max-w-[80px] truncate text-[10px] font-medium text-ink">{node.nodeLabel}</span>
                {node.durationMs !== null && (
                  <span className={cn("text-[10px]", cfg.color)}>
                    {(node.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
                {node.status === "queued" && (
                  <span className="text-[10px] text-mute">Queued</span>
                )}
              </button>
              {i < nodeRuns.length - 1 && (
                <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-hairline" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3  Event timeline (left column)                                    */
/* ------------------------------------------------------------------ */

function EventTimeline({ events }: { events: RunEvent[] }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      <div className="border-b border-hairline-soft px-4 py-2.5">
        <h3 className="text-xs font-semibold text-ink">Event Timeline</h3>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {events.map((ev, i) => (
          <div
            key={ev.id}
            className={cn(
              "flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-start sm:gap-3 sm:py-2",
              i < events.length - 1 && "border-b border-hairline-soft",
            )}
          >
            <span className="shrink-0 font-mono text-[11px] text-mute sm:mt-0.5">
              {formatTimestamp(ev.timestamp)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[11px] font-medium text-body">{ev.nodeLabel}</span>
              <span className={cn(
                "text-[11px]",
                ev.type === "completed" && "text-accent-green",
                ev.type === "error" && "text-accent-red",
                ev.type === "skipped" && "text-mute",
                (ev.type === "started" || ev.type === "output_chunk") && "text-body",
              )}>
                {ev.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4  Node detail panel with tabs (right column)                      */
/* ------------------------------------------------------------------ */

const nodeTabs = ["Input", "Output", "Logs", "Cost"] as const;
type NodeTab = (typeof nodeTabs)[number];

/** Mock per-node cost breakdown */
function costForNode(node: NodeRun): { input: number; output: number; total: number } {
  if (!node.tokenCount) return { input: 0, output: 0, total: 0 };
  const inputTokens = Math.floor(node.tokenCount * 0.6);
  const outputTokens = node.tokenCount - inputTokens;
  const inputCost = (inputTokens / 1000) * 0.003;
  const outputCost = (outputTokens / 1000) * 0.015;
  return { input: inputCost, output: outputCost, total: inputCost + outputCost };
}

/** Mock log entries for a node */
function logsForNode(node: NodeRun): { time: string; level: "INFO" | "WARN" | "DEBUG"; msg: string }[] {
  if (node.status === "skipped" || node.status === "idle" || node.status === "queued") return [];
  const base = node.startedAt ? formatTimestamp(node.startedAt) : "--";
  const entries: { time: string; level: "INFO" | "WARN" | "DEBUG"; msg: string }[] = [
    { time: base, level: "INFO", msg: `Starting ${node.nodeLabel}...` },
  ];
  if (node.nodeType === "llm") {
    entries.push({ time: base, level: "DEBUG", msg: `Model: ${node.nodeType} | Temperature: 0.7` });
    if (node.tokenCount) {
      entries.push({ time: base, level: "INFO", msg: `Prompt tokens: ${Math.floor(node.tokenCount * 0.6).toLocaleString()}` });
    }
  }
  if (node.error) {
    entries.push({ time: base, level: "WARN", msg: node.error });
  }
  if (node.completedAt) {
    entries.push({ time: formatTimestamp(node.completedAt), level: "INFO", msg: `Completed in ${formatDuration(node.durationMs)}` });
  }
  return entries;
}

function NodeDetailPanel({ node, run }: { node: NodeRun | undefined; run: WorkflowRun }) {
  const [tab, setTab] = useState<NodeTab>("Output");

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-hairline bg-surface-card p-8">
        <MascotPlaceholder size="sm" mood="thinking" />
        <p className="mt-3 text-xs text-mute">Select a node to inspect.</p>
      </div>
    );
  }

  const cost = costForNode(node);
  const logs = logsForNode(node);

  /** Mock input: find upstream node output */
  const nodeIndex = run.nodeRuns.findIndex((n) => n.nodeId === node.nodeId);
  const upstreamNode = nodeIndex > 0 ? run.nodeRuns[nodeIndex - 1] : null;

  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <NodeStatusIcon status={node.status} />
          <h3 className="text-xs font-semibold text-ink">{node.nodeLabel}</h3>
          <StatusBadge status={node.status} />
        </div>
        {node.durationMs !== null && (
          <span className="font-mono text-[11px] text-mute">{formatDuration(node.durationMs)}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline-soft px-4" role="tablist">
        {nodeTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            role="tab"
            aria-selected={tab === t}
            className={cn(
              "relative px-3 py-3 text-[11px] font-medium transition-colors sm:py-2",
              tab === t ? "text-ink" : "text-mute hover:text-body",
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary-cta" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-h-[320px] overflow-y-auto p-4" role="tabpanel">
        {/* Input tab */}
        {tab === "Input" && (
          <div>
            {upstreamNode?.output ? (
              <>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-mute">
                  From: {upstreamNode.nodeLabel}
                </p>
                <pre className="whitespace-pre-wrap rounded-md bg-surface-dark p-3 font-mono text-[11px] leading-relaxed text-on-dark">
                  {upstreamNode.output}
                </pre>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <MascotPlaceholder size="sm" mood="neutral" />
                <p className="mt-2 text-[11px] text-mute">No input data — this is the first node.</p>
              </div>
            )}
          </div>
        )}

        {/* Output tab */}
        {tab === "Output" && (
          <div>
            {node.error && (
              <div className="mb-3 rounded-md border border-accent-red/20 bg-accent-red-soft px-3 py-2">
                <p className="text-[11px] font-semibold text-accent-red">Error</p>
                <p className="mt-0.5 font-mono text-[11px] text-accent-red">{node.error}</p>
              </div>
            )}
            {node.output ? (
              <>
                {node.status === "running" && (
                  <div className="mb-2 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-accent-blue" />
                    <span className="text-[11px] font-medium text-accent-blue">Streaming...</span>
                  </div>
                )}
                <pre className="whitespace-pre-wrap rounded-md bg-surface-dark p-3 font-mono text-[11px] leading-relaxed text-on-dark">
                  {node.output}
                </pre>
              </>
            ) : (
              !node.error && (
                <div className="flex flex-col items-center py-4">
                  <MascotPlaceholder size="sm" mood="thinking" />
                  <p className="mt-2 text-[11px] text-mute">
                    {node.status === "queued" ? "Waiting in queue..." : "No output available."}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Logs tab */}
        {tab === "Logs" && (
          <div>
            {logs.length === 0 ? (
              <p className="text-[11px] text-mute">No logs for this node.</p>
            ) : (
              <div className="rounded-md bg-surface-dark p-3">
                {logs.map((entry, i) => (
                  <div key={i} className="flex gap-2 font-mono text-[11px] leading-5">
                    <span className="shrink-0 text-mute">{entry.time}</span>
                    <span className={cn(
                      "shrink-0 w-12",
                      entry.level === "INFO" && "text-accent-blue",
                      entry.level === "WARN" && "text-primary-cta",
                      entry.level === "DEBUG" && "text-mute",
                    )}>
                      {entry.level}
                    </span>
                    <span className="text-on-dark">{entry.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cost tab */}
        {tab === "Cost" && (
          <div>
            {node.tokenCount ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-hairline-soft p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Input Tokens</p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink">
                      {Math.floor(node.tokenCount * 0.6).toLocaleString()}
                    </p>
                    <p className="font-mono text-[10px] text-mute">${cost.input.toFixed(4)}</p>
                  </div>
                  <div className="rounded-md border border-hairline-soft p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Output Tokens</p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink">
                      {(node.tokenCount - Math.floor(node.tokenCount * 0.6)).toLocaleString()}
                    </p>
                    <p className="font-mono text-[10px] text-mute">${cost.output.toFixed(4)}</p>
                  </div>
                  <div className="rounded-md border border-hairline-soft p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Total Cost</p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink">${cost.total.toFixed(4)}</p>
                  </div>
                </div>
                <div className="rounded-md border border-hairline-soft p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Model</p>
                  <p className="mt-1 font-mono text-xs text-body">{node.nodeType === "llm" ? "gpt-4o" : node.nodeType}</p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-mute">No token usage — this node does not call an LLM.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5  Node execution list (left column, below DAG)                    */
/* ------------------------------------------------------------------ */

function NodeTimeline({ nodeRuns, selectedNodeId, onSelectNode }: {
  nodeRuns: NodeRun[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      <div className="border-b border-hairline-soft px-4 py-2.5">
        <h3 className="text-xs font-semibold text-ink">Node Execution</h3>
      </div>
      <div className="divide-y divide-hairline-soft">
        {nodeRuns.map((node) => (
          <button
            key={node.nodeId}
            onClick={() => onSelectNode(node.nodeId)}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-soft/50 sm:py-2.5",
              selectedNodeId === node.nodeId && "bg-surface-soft",
            )}
          >
            <NodeStatusIcon status={node.status} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{node.nodeLabel}</p>
              <p className="text-[10px] text-mute">{node.nodeType}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-[11px] text-mute">
              {node.durationMs !== null && (
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {(node.durationMs / 1000).toFixed(1)}s
                </span>
              )}
              {node.tokenCount !== null && (
                <span className="flex items-center gap-1 font-mono">
                  <Hash className="h-3 w-3" />
                  {formatTokens(node.tokenCount)}
                </span>
              )}
            </div>
            <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-mute", selectedNodeId === node.nodeId && "text-ink")} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  6  Full logs table (bottom)                                        */
/* ------------------------------------------------------------------ */

const levelColors: Record<string, string> = {
  INFO: "text-accent-blue",
  WARN: "text-primary-cta",
  DEBUG: "text-mute",
  ERROR: "text-accent-red",
};

function FullLogsTable({ run }: { run: WorkflowRun }) {
  /** Build a combined log from all events + per-node logs */
  const allLogs: { timestamp: string; level: string; node: string; message: string }[] = [];

  for (const ev of run.events) {
    const level = ev.type === "error" ? "ERROR" : ev.type === "started" ? "INFO" : ev.type === "completed" ? "INFO" : ev.type === "skipped" ? "WARN" : "DEBUG";
    allLogs.push({
      timestamp: formatTimestamp(ev.timestamp),
      level,
      node: ev.nodeLabel,
      message: ev.message,
    });
  }

  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4 py-2.5">
        <h3 className="text-xs font-semibold text-ink">Detailed Run Logs</h3>
        <span className="text-[10px] text-mute">{allLogs.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-hairline-soft bg-surface-soft/50">
              <th className="px-4 py-2 font-medium text-mute">Timestamp</th>
              <th className="px-4 py-2 font-medium text-mute">Level</th>
              <th className="px-4 py-2 font-medium text-mute">Node</th>
              <th className="px-4 py-2 font-medium text-mute">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft font-mono">
            {allLogs.map((log, i) => (
              <tr key={i} className="hover:bg-surface-soft/30">
                <td className="whitespace-nowrap px-4 py-1.5 text-mute">{log.timestamp}</td>
                <td className="whitespace-nowrap px-4 py-1.5">
                  <span className={cn("font-semibold", levelColors[log.level] ?? "text-body")}>{log.level}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-1.5 font-medium text-body">{log.node}</td>
                <td className="px-4 py-1.5 text-body">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RunDetailPage(props: { params: Promise<{ runId: string }> }) {
  const { runId } = React.use(props.params);
  const run: WorkflowRun | undefined = mockRuns.find((r) => r.id === runId);

  const firstActionableNode = run?.nodeRuns.find(
    (n) => n.status === "completed" || n.status === "error" || n.status === "running",
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    firstActionableNode?.nodeId ?? null,
  );

  /* ---------- Not found ---------- */
  if (!run) {
    return (
      <div className="p-6">
        <Link href="/runs" className="inline-flex items-center gap-1.5 text-xs text-mute transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Runs
        </Link>
        <div className="mt-8 flex flex-col items-center rounded-md border border-hairline bg-surface-card p-10">
          <MascotPlaceholder size="md" mood="thinking" />
          <p className="mt-4 text-sm font-semibold text-ink">Run not found</p>
          <p className="mt-1 text-xs text-mute">No run with ID &quot;{runId}&quot; exists.</p>
        </div>
      </div>
    );
  }

  const selectedNode = run.nodeRuns.find((n) => n.nodeId === selectedNodeId);
  const isRunning = run.status === "running";

  return (
    <div className="p-4 sm:p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link href="/runs" className="inline-flex items-center gap-1.5 text-xs text-mute transition-colors hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Runs
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-base font-bold text-ink sm:text-lg">Run: {run.workflowName}</h1>
            <StatusBadge status={run.status} />
          </div>
          <p className="mt-0.5 truncate font-mono text-[11px] text-mute">{run.id}</p>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            disabled={!isRunning}
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-md px-3 text-[11px] font-medium transition-colors sm:h-8 sm:px-2.5",
              isRunning ? "bg-primary-cta text-on-primary hover:bg-primary-pressed" : "cursor-not-allowed bg-surface-soft text-stone",
            )}
          >
            <Play className="h-3 w-3" />
            Resume
          </button>
          <button
            disabled={!isRunning}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8",
              isRunning ? "text-body hover:bg-surface-soft hover:text-ink" : "cursor-not-allowed text-stone",
            )}
            title="Pause"
            aria-label="Pause"
          >
            <Pause className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={!isRunning}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8",
              isRunning ? "text-accent-red hover:bg-accent-red-soft" : "cursor-not-allowed text-stone",
            )}
            title="Stop"
            aria-label="Stop"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-5 w-px bg-hairline-soft" />
          <button className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-[11px] font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink sm:h-8 sm:px-2.5">
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
      </div>

      {/* ---- Summary cards ---- */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Status" value={statusConfig[run.status].label} icon={Activity} />
        <MetricCard label="Duration" value={formatDuration(run.durationMs)} icon={Clock} />
        <MetricCard label="Cost" value={formatCost(run.estimatedCost)} icon={DollarSign} />
        <MetricCard label="Tokens" value={formatTokens(run.totalTokens)} icon={Hash} />
      </div>

      {/* ---- DAG preview ---- */}
      <div className="mt-5">
        <DagPreview nodeRuns={run.nodeRuns} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
      </div>

      {/* ---- Main content: timeline + event list + node detail ---- */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <NodeTimeline nodeRuns={run.nodeRuns} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
          <EventTimeline events={run.events} />
        </div>
        <NodeDetailPanel node={selectedNode} run={run} />
      </div>

      {/* ---- Full logs table ---- */}
      <div className="mt-5">
        <FullLogsTable run={run} />
      </div>
    </div>
  );
}
