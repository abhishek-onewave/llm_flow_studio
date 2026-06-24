import Link from "next/link";
import { MascotPlaceholder } from "@/components/ui/mascot-placeholder";
import { Button } from "@/components/ui/button";
import { mockWorkflowSummaries } from "@/lib/mock/workflows";
import { mockRunSummaries } from "@/lib/mock/runs";
import { mockIntegrations } from "@/lib/mock/integrations";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  Coins,
  Workflow,
  GitBranch,
  Plug,
  Circle,
  Rocket,
  Check,
  GitPullRequest,
  Database,
  Globe,
  Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    completed: {
      bg: "bg-accent-green-soft",
      text: "text-accent-green",
      icon: <CheckCircle2 size={12} />,
    },
    error: {
      bg: "bg-accent-red-soft",
      text: "text-accent-red",
      icon: <XCircle size={12} />,
    },
    running: {
      bg: "bg-accent-blue-soft",
      text: "text-accent-blue",
      icon: <Clock size={12} />,
    },
  };
  const s = map[status] ?? {
    bg: "bg-surface-soft",
    text: "text-mute",
    icon: <Circle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${s.bg} ${s.text}`}
    >
      {s.icon}
      {status}
    </span>
  );
}

function IntegrationIcon({ slug }: { slug: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    github: <GitPullRequest size={16} />,
    database: <Database size={16} />,
    vercel: <Globe size={16} />,
    search: <Search size={16} />,
  };
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-soft text-body">
      {iconMap[slug] ?? <Plug size={16} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checklist items                                                    */
/* ------------------------------------------------------------------ */

const checklistItems = [
  { label: "Create your first workflow", done: true, href: "/workflows/builder" },
  { label: "Add an LLM node", done: true, href: "/workflows/builder" },
  { label: "Run a mock execution", done: false, href: "/workflows/builder" },
  { label: "Connect an integration", done: false, href: "/integrations" },
  { label: "Invite a team member", done: false, href: "/settings" },
];

/* ================================================================== */
/*  Dashboard Page                                                     */
/* ================================================================== */

export default function DashboardPage() {
  /* Top 5 workflows for recent list (add a 5th placeholder) */
  const recentWorkflows = [
    ...mockWorkflowSummaries,
    {
      id: "wf-support-triage",
      name: "Support Ticket Router",
      description: "Classify and route incoming support tickets.",
      nodeCount: 5,
      lastRunAt: null,
      lastRunStatus: null,
      updatedAt: "2026-06-18T09:00:00Z",
      tags: ["support"],
    },
  ];

  const topIntegrations = mockIntegrations.slice(0, 4);
  const connectedCount = mockIntegrations.filter(
    (i) => i.status === "connected"
  ).length;

  const completedChecks = checklistItems.filter((c) => c.done).length;

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <MascotPlaceholder size="sm" mood="happy" />
          <div>
            <h1 className="text-xl font-bold text-ink">
              Good morning, your AI workflows are ready.
            </h1>
            <p className="mt-0.5 text-sm text-body">
              Create a new workflow, inspect recent runs, or continue from a
              saved prototype.
            </p>
          </div>
        </div>
        <Link href="/workflows/builder?new=1" className="shrink-0 sm:w-auto w-full">
          <Button className="w-full sm:w-auto">
            <Plus size={16} className="mr-1.5" />
            New workflow
          </Button>
        </Link>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Runs this month"
          value="128"
        />
        <StatCard
          icon={<Zap size={18} />}
          label="Tokens"
          value="4.2M"
        />
        <StatCard
          icon={<Coins size={18} />}
          label="Estimated cost"
          value="$42.18"
        />
        <StatCard
          icon={<Workflow size={18} />}
          label="Active workflows"
          value={String(recentWorkflows.length)}
        />
      </div>

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* ── Recent workflows (span 2 cols) ──────────────────── */}
        <div className="rounded-md border border-hairline bg-surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-mute" />
              <h2 className="text-sm font-bold text-ink">Recent Workflows</h2>
            </div>
            <Link
              href="/workflows"
              className="flex items-center gap-1 text-xs font-medium text-mute transition-colors hover:text-ink"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-hairline-soft">
            {recentWorkflows.map((wf) => (
              <div
                key={wf.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href="/workflows/builder"
                    className="text-sm font-semibold text-ink hover:underline"
                  >
                    {wf.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-mute">
                    {wf.nodeCount} nodes &middot; Updated{" "}
                    {formatRelativeTime(wf.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {wf.lastRunStatus && (
                    <StatusBadge status={wf.lastRunStatus} />
                  )}
                  <Link
                    href="/workflows/builder"
                    className="text-xs font-medium text-mute transition-colors hover:text-ink"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick start checklist ──────────────────────────── */}
        <div className="rounded-md border border-hairline bg-surface-card p-6">
          <div className="flex items-center gap-2">
            <Rocket size={16} className="text-mute" />
            <h2 className="text-sm font-bold text-ink">Quick Start</h2>
          </div>
          <p className="mt-1 text-xs text-mute">
            {completedChecks}/{checklistItems.length} completed
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full bg-primary-cta"
              style={{
                width: `${(completedChecks / checklistItems.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {checklistItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2.5 text-sm"
              >
                {item.done ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-green-soft text-accent-green">
                    <Check size={12} />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-card" />
                )}
                <span
                  className={
                    item.done
                      ? "text-mute line-through"
                      : "font-medium text-ink"
                  }
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Second row ─────────────────────────────────────────── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* ── Recent runs table (span 2 cols) ─────────────────── */}
        <div className="rounded-md border border-hairline bg-surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-mute" />
              <h2 className="text-sm font-bold text-ink">Recent Runs</h2>
            </div>
            <Link
              href="/runs"
              className="flex items-center gap-1 text-xs font-medium text-mute transition-colors hover:text-ink"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm" aria-label="Recent runs">
              <thead>
                <tr className="border-b border-hairline-soft text-xs font-medium text-mute">
                  <th scope="col" className="pb-2 pr-4 font-medium">Workflow</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Status</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Started</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Duration</th>
                  <th scope="col" className="pb-2 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {mockRunSummaries.map((run) => (
                  <tr key={run.id} className="text-sm">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/runs/${run.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {run.workflowName}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-mute">
                      {formatRelativeTime(run.startedAt)}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-mute">
                      {formatDuration(run.durationMs)}
                    </td>
                    <td className="py-2.5 text-right text-xs text-mute">
                      ${run.estimatedCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Integrations card ───────────────────────────────── */}
        <div className="rounded-md border border-hairline bg-surface-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plug size={16} className="text-mute" />
              <h2 className="text-sm font-bold text-ink">Integrations</h2>
            </div>
            <Link
              href="/integrations"
              className="flex items-center gap-1 text-xs font-medium text-mute transition-colors hover:text-ink"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <p className="mt-1 text-xs text-mute">
            {connectedCount} of {mockIntegrations.length} connected
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {topIntegrations.map((integ) => (
              <div
                key={integ.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <IntegrationIcon slug={integ.iconSlug} />
                  <div>
                    <span className="text-sm font-medium text-ink">
                      {integ.name}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    integ.status === "connected"
                      ? "text-accent-green"
                      : "text-mute"
                  }`}
                >
                  {integ.status === "connected" ? "Connected" : "Not connected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-surface-card p-6">
      <div className="flex items-center gap-2 text-mute">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
