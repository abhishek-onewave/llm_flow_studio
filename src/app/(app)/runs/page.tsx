"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Play,
  Download,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  DollarSign,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  FileText,
  Zap,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockRuns, mockRunSummaries } from "@/lib/mock/runs";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import type { WorkflowRun } from "@/types/runs";
import type { NodeStatus } from "@/types/workflow";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDuration(ms: number | null): string {
  if (ms === null) return "--";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
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

function StatusChip({ status }: { status: NodeStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.bg, cfg.color)}>
      <Icon className={cn("h-2.5 w-2.5", status === "running" && "animate-spin")} />
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter bar                                                         */
/* ------------------------------------------------------------------ */

const workflowNames = [...new Set(mockRunSummaries.map((r) => r.workflowName))];
const statusOptions: NodeStatus[] = ["completed", "error", "running", "skipped"];

function FilterBar({
  search, onSearch,
  workflowFilter, onWorkflowFilter,
  statusFilter, onStatusFilter,
}: {
  search: string; onSearch: (v: string) => void;
  workflowFilter: string; onWorkflowFilter: (v: string) => void;
  statusFilter: string; onStatusFilter: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search runs..."
          aria-label="Search runs"
          className="h-10 w-full rounded-md border border-hairline bg-surface-card pl-9 pr-3 text-xs text-ink placeholder:text-stone focus:border-accent-blue focus:outline-none sm:h-8"
        />
      </div>

      {/* Workflow dropdown */}
      <div className="relative">
        <select
          value={workflowFilter}
          onChange={(e) => onWorkflowFilter(e.target.value)}
          aria-label="Filter by workflow"
          className="h-10 appearance-none rounded-md border border-hairline bg-surface-card pl-3 pr-8 text-xs text-body focus:border-accent-blue focus:outline-none sm:h-8"
        >
          <option value="">All Workflows</option>
          {workflowNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-mute" />
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="h-10 appearance-none rounded-md border border-hairline bg-surface-card pl-3 pr-8 text-xs text-body focus:border-accent-blue focus:outline-none sm:h-8"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-mute" />
      </div>

      {/* Provider placeholder */}
      <div className="relative">
        <select
          disabled
          aria-label="Filter by provider"
          className="h-10 appearance-none rounded-md border border-hairline bg-surface-soft pl-3 pr-8 text-xs text-stone sm:h-8"
        >
          <option>Provider</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-stone" />
      </div>

      {/* Date range placeholder */}
      <button disabled className="h-8 rounded-md border border-hairline bg-surface-soft px-3 text-xs text-stone">
        Date range
      </button>

      {/* Cost threshold placeholder */}
      <button disabled className="h-8 rounded-md border border-hairline bg-surface-soft px-3 text-xs text-stone">
        Cost &gt; $0.00
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini DAG for selected run summary                                  */
/* ------------------------------------------------------------------ */

function MiniDag({ run }: { run: WorkflowRun }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {run.nodeRuns.map((node, i) => {
        const cfg = statusConfig[node.status];
        return (
          <div key={node.nodeId} className="flex items-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                node.status === "completed" && "bg-accent-green-soft",
                node.status === "error" && "bg-accent-red-soft",
                node.status === "running" && "bg-accent-blue-soft",
                (node.status === "queued" || node.status === "idle" || node.status === "skipped") && "bg-surface-soft",
              )}>
                {(() => {
                  const Icon = cfg.icon;
                  return <Icon className={cn("h-3 w-3", cfg.color, node.status === "running" && "animate-spin")} />;
                })()}
              </div>
              <span className="max-w-[56px] truncate text-[9px] text-mute">{node.nodeLabel}</span>
            </div>
            {i < run.nodeRuns.length - 1 && (
              <ArrowRight className="mx-0.5 h-2.5 w-2.5 shrink-0 text-hairline" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Selected run summary card                                          */
/* ------------------------------------------------------------------ */

function RunSummaryCard({ run }: { run: WorkflowRun | undefined }) {
  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-hairline bg-surface-card p-6">
        <MascotPlaceholder size="sm" mood="thinking" />
        <p className="mt-3 text-[11px] text-mute">Select a run to preview.</p>
      </div>
    );
  }

  const errorNode = run.nodeRuns.find((n) => n.status === "error");

  return (
    <div className="rounded-md border border-hairline bg-surface-card">
      <div className="border-b border-hairline-soft px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink">{run.workflowName}</h3>
          <StatusChip status={run.status} />
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-mute">{run.id}</p>
      </div>

      {/* Mini DAG */}
      <div className="border-b border-hairline-soft px-4 py-2">
        <MiniDag run={run} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border-b border-hairline-soft">
        <div className="border-r border-hairline-soft px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Duration</p>
          <p className="font-mono text-xs font-bold text-ink">{formatDuration(run.durationMs)}</p>
        </div>
        <div className="border-r border-hairline-soft px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Tokens</p>
          <p className="font-mono text-xs font-bold text-ink">{formatTokens(run.totalTokens)}</p>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-mute">Cost</p>
          <p className="font-mono text-xs font-bold text-ink">{formatCost(run.estimatedCost)}</p>
        </div>
      </div>

      {/* Error preview */}
      {errorNode && (
        <div className="border-b border-hairline-soft px-4 py-2">
          <div className="rounded-md border border-accent-red/20 bg-accent-red-soft px-3 py-2">
            <p className="text-[10px] font-semibold text-accent-red">
              Error in {errorNode.nodeLabel}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-accent-red">
              {errorNode.error}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Link
          href={`/runs/${run.id}`}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-primary-cta px-3 text-[11px] font-bold text-on-primary transition-colors hover:bg-primary-pressed"
        >
          Open run
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-3 text-[11px] font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink">
          <RotateCcw className="h-3 w-3" />
          Rerun
        </button>
        <button className="inline-flex h-7 items-center gap-1 rounded-md border border-hairline px-3 text-[11px] font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink">
          <FileText className="h-3 w-3" />
          Logs
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight cards                                                      */
/* ------------------------------------------------------------------ */

function InsightCards() {
  const completedRuns = mockRuns.filter((r) => r.status === "completed");
  const errorRuns = mockRuns.filter((r) => r.status === "error");

  const mostExpensive = completedRuns.length > 0
    ? completedRuns.reduce((a, b) => (a.estimatedCost > b.estimatedCost ? a : b))
    : null;

  const fastest = completedRuns.length > 0
    ? completedRuns.reduce((a, b) => ((a.durationMs ?? Infinity) < (b.durationMs ?? Infinity) ? a : b))
    : null;

  const failingNodeCounts: Record<string, number> = {};
  for (const run of errorRuns) {
    for (const nr of run.nodeRuns) {
      if (nr.status === "error") {
        failingNodeCounts[nr.nodeLabel] = (failingNodeCounts[nr.nodeLabel] ?? 0) + 1;
      }
    }
  }
  const mostFailingNode = Object.entries(failingNodeCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-md border border-hairline bg-surface-card p-4">
        <div className="flex items-center gap-2 text-mute">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Most Expensive</span>
        </div>
        {mostExpensive ? (
          <>
            <p className="mt-1.5 text-xs font-semibold text-ink">{mostExpensive.workflowName}</p>
            <p className="font-mono text-[11px] text-mute">{formatCost(mostExpensive.estimatedCost)} &middot; {formatTokens(mostExpensive.totalTokens)} tokens</p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-mute">No data</p>
        )}
      </div>

      <div className="rounded-md border border-hairline bg-surface-card p-4">
        <div className="flex items-center gap-2 text-mute">
          <Zap className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Fastest Success</span>
        </div>
        {fastest ? (
          <>
            <p className="mt-1.5 text-xs font-semibold text-ink">{fastest.workflowName}</p>
            <p className="font-mono text-[11px] text-mute">{formatDuration(fastest.durationMs)}</p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-mute">No data</p>
        )}
      </div>

      <div className="rounded-md border border-hairline bg-surface-card p-4">
        <div className="flex items-center gap-2 text-mute">
          <TrendingDown className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Most Failing Node</span>
        </div>
        {mostFailingNode ? (
          <>
            <p className="mt-1.5 text-xs font-semibold text-ink">{mostFailingNode[0]}</p>
            <p className="font-mono text-[11px] text-accent-red">{mostFailingNode[1]} failure{mostFailingNode[1] > 1 ? "s" : ""}</p>
          </>
        ) : (
          <p className="mt-1.5 text-xs text-mute">No failures</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RunsPage() {
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(mockRunSummaries[0]?.id ?? null);

  const filteredRuns = useMemo(() => {
    return mockRunSummaries.filter((r) => {
      if (search && !r.workflowName.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (workflowFilter && r.workflowName !== workflowFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [search, workflowFilter, statusFilter]);

  const selectedRun = mockRuns.find((r) => r.id === selectedRunId);

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Runs</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Every workflow run, fully traceable.</h1>
          <p className="mt-1 text-sm text-body">
            Inspect execution history, debug failures, and monitor cost across all your workflows.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink sm:h-8">
            <Download className="h-3.5 w-3.5" />
            Export logs
          </button>
          <Link
            href="/workflows/builder"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8"
          >
            <Play className="h-3.5 w-3.5" />
            Run workflow
          </Link>
        </div>
      </div>

      {/* ---- Filter bar ---- */}
      <div className="mt-5">
        <FilterBar
          search={search} onSearch={setSearch}
          workflowFilter={workflowFilter} onWorkflowFilter={setWorkflowFilter}
          statusFilter={statusFilter} onStatusFilter={setStatusFilter}
        />
      </div>

      {/* ---- Main: table + sidebar ---- */}
      <div className="mt-5 flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_320px]">
        {/* Runs table */}
        <div className="min-w-0 rounded-md border border-hairline bg-surface-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]" aria-label="Runs">
              <thead>
                <tr className="border-b border-hairline-soft bg-surface-soft/50">
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Run</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Workflow</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Status</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Started</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Duration</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Nodes</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Tokens</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Cost</th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-mute">Triggered by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {filteredRuns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <MascotPlaceholder size="sm" mood="thinking" />
                        <p className="mt-2 text-xs text-mute">No runs match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRuns.map((run) => {
                    const fullRun = mockRuns.find((r) => r.id === run.id);
                    const nodeCount = fullRun?.nodeRuns.length ?? 0;
                    return (
                      <tr
                        key={run.id}
                        onClick={() => setSelectedRunId(run.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedRunId(run.id); } }}
                        tabIndex={0}
                        role="row"
                        aria-selected={selectedRunId === run.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-surface-soft/30",
                          selectedRunId === run.id && "bg-surface-soft/50",
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono font-medium text-ink">
                          {run.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-body">
                          {run.workflowName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <StatusChip status={run.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-mute">
                          <div>{formatDate(run.startedAt)}</div>
                          <div className="font-mono text-[10px]">{formatTime(run.startedAt)}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">
                          {formatDuration(run.durationMs)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-body">
                          {nodeCount}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">
                          {formatTokens(run.totalTokens)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-body">
                          {formatCost(run.estimatedCost)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-mute">
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-mute">
                            Manual
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected run summary */}
        <div className="lg:sticky lg:top-6">
          <RunSummaryCard run={selectedRun} />
        </div>
      </div>

      {/* ---- Insight cards ---- */}
      <div className="mt-5">
        <InsightCards />
      </div>
    </div>
  );
}
