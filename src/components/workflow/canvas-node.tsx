"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  FileText,
  FileOutput,
  Bot,
  Sparkles,
  Zap,
  CircleDot,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Loader2,
  XCircle,
  Cpu,
  Boxes,
  GitPullRequest,
  Globe,
  Database,
  Code2,
  Search,
  UserCheck,
  GitBranch,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WorkflowNodeData {
  label: string;
  subtitle: string;
  colorKey: string;
  status?: "idle" | "queued" | "completed" | "running" | "error" | "skipped";
  [key: string]: unknown;
}

export type WorkflowNode = Node<WorkflowNodeData, "workflow">;

/* ------------------------------------------------------------------ */
/*  Styling helpers                                                    */
/* ------------------------------------------------------------------ */

const typeColors: Record<string, string> = {
  input: "#2c84e0",
  file_reader: "#2c84e0",
  file_writer: "#2c84e0",
  openai: "#2c8c66",
  anthropic: "#7c44a6",
  google: "#2c84e0",
  mistral: "#cd4239",
  openrouter: "#6c6e63",
  custom: "#6c6e63",
  github: "#23251d",
  vercel: "#23251d",
  database: "#2c8c66",
  http_api: "#2c84e0",
  web_search: "#2c84e0",
  code_executor: "#7c44a6",
  human_approval: "#f7a501",
  condition: "#cd4239",
  output: "#f7a501",
};

const typeIcons: Record<string, React.ReactNode> = {
  input: <FileText size={14} />,
  file_reader: <FileText size={14} />,
  file_writer: <FileOutput size={14} />,
  openai: <Bot size={14} />,
  anthropic: <Sparkles size={14} />,
  google: <Zap size={14} />,
  mistral: <Cpu size={14} />,
  openrouter: <Boxes size={14} />,
  custom: <Bot size={14} />,
  github: <GitPullRequest size={14} />,
  vercel: <Globe size={14} />,
  database: <Database size={14} />,
  http_api: <Code2 size={14} />,
  web_search: <Search size={14} />,
  code_executor: <Code2 size={14} />,
  human_approval: <UserCheck size={14} />,
  condition: <GitBranch size={14} />,
  output: <CircleDot size={14} />,
};

const statusChips: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  queued: {
    bg: "bg-surface-soft",
    text: "text-mute",
    icon: <Loader2 size={10} />,
    label: "Queued",
  },
  running: {
    bg: "bg-accent-blue-soft",
    text: "text-accent-blue",
    icon: <Loader2 size={10} className="animate-spin" />,
    label: "Running",
  },
  completed: {
    bg: "bg-accent-green-soft",
    text: "text-accent-green",
    icon: <CheckCircle2 size={10} />,
    label: "Done",
  },
  error: {
    bg: "bg-accent-red-soft",
    text: "text-accent-red",
    icon: <XCircle size={10} />,
    label: "Error",
  },
  skipped: {
    bg: "bg-surface-soft",
    text: "text-mute",
    icon: <Square size={10} />,
    label: "Skipped",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function WorkflowNodeComponent({ data, selected }: NodeProps<WorkflowNode>) {
  const color = typeColors[data.colorKey] ?? "#bfc1b7";
  const icon = typeIcons[data.colorKey] ?? <Bot size={14} />;
  const chip = data.status ? statusChips[data.status] : null;

  return (
    <>
      {/* Target handle — top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !rounded-full !border !border-hairline !bg-surface-card"
      />

      <div
        className={cn(
          "relative w-48 rounded-md border bg-surface-card transition-colors",
          selected ? "border-ink" : "border-hairline"
        )}
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        {/* Selected yellow marker */}
        {selected && (
          <div className="absolute -left-[3px] top-2.5 h-5 w-1 rounded-r-sm bg-primary-cta" />
        )}

        {/* Header */}
        <div className="flex items-center gap-2 px-3 pt-2.5">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px]"
            style={{ backgroundColor: color + "18", color }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">{data.label}</p>
            <p className="truncate text-[11px] text-mute">{data.subtitle}</p>
          </div>
        </div>

        {/* Footer — status chip + mini controls */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
          {chip ? (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${chip.bg} ${chip.text}`}
            >
              {chip.icon}
              {chip.label}
            </span>
          ) : (
            <span className="text-[10px] text-mute">Idle</span>
          )}
          <div className="flex items-center gap-0.5">
            <button aria-label="Run node" className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
              <Play size={10} />
            </button>
            <button aria-label="Pause node" className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
              <Pause size={10} />
            </button>
            <button aria-label="Stop node" className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink">
              <Square size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* Source handle — bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !rounded-full !border !border-hairline !bg-surface-card"
      />
    </>
  );
}

export default memo(WorkflowNodeComponent);
