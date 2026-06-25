"use client";

import type { DragEvent } from "react";
import {
  Bot,
  FileText,
  FileOutput,
  GitPullRequest,
  Globe,
  Database,
  Code2,
  Search,
  UserCheck,
  GitBranch,
  CircleDot,
  Cpu,
  Sparkles,
  Boxes,
  Zap,
  X,
  ImageIcon,
} from "lucide-react";
import type { PaletteItem } from "@/lib/workflow/node-defaults";

/* ------------------------------------------------------------------ */
/*  Palette data                                                       */
/* ------------------------------------------------------------------ */

interface PaletteEntry extends PaletteItem {
  icon: React.ReactNode;
}

const llmNodes: PaletteEntry[] = [
  { nodeType: "openai", label: "OpenAI", subtitle: "gpt-4o", icon: <Bot size={14} /> },
  { nodeType: "anthropic", label: "Claude", subtitle: "claude-sonnet-4", icon: <Sparkles size={14} /> },
  { nodeType: "google", label: "Gemini", subtitle: "gemini-2.5-pro", icon: <Zap size={14} /> },
  { nodeType: "mistral", label: "Mistral", subtitle: "mistral-large", icon: <Cpu size={14} /> },
  { nodeType: "openrouter", label: "OpenRouter", subtitle: "auto", icon: <Boxes size={14} /> },
  { nodeType: "custom", label: "Custom model", subtitle: "custom-model", icon: <Bot size={14} /> },
];

const imageNodes: PaletteEntry[] = [
  { nodeType: "openai_image", label: "OpenAI Image", subtitle: "DALL-E 3", icon: <ImageIcon size={14} /> },
  { nodeType: "google_image", label: "Gemini Image", subtitle: "Imagen", icon: <ImageIcon size={14} /> },
];

const toolNodes: PaletteEntry[] = [
  { nodeType: "file_reader", label: "File Reader", subtitle: "File Reader", icon: <FileText size={14} /> },
  { nodeType: "file_writer", label: "File Writer", subtitle: "File Writer", icon: <FileOutput size={14} /> },
  { nodeType: "github", label: "GitHub", subtitle: "read_file", icon: <GitPullRequest size={14} /> },
  { nodeType: "vercel", label: "Vercel", subtitle: "deploy", icon: <Globe size={14} /> },
  { nodeType: "database", label: "Database", subtitle: "postgresql", icon: <Database size={14} /> },
  { nodeType: "http_api", label: "HTTP API", subtitle: "GET", icon: <Code2 size={14} /> },
  { nodeType: "web_search", label: "Web Search", subtitle: "google", icon: <Search size={14} /> },
  { nodeType: "code_executor", label: "Code Executor", subtitle: "javascript", icon: <Code2 size={14} /> },
];

const logicNodes: PaletteEntry[] = [
  { nodeType: "human_approval", label: "Human Approval", subtitle: "Approval gate", icon: <UserCheck size={14} /> },
  { nodeType: "condition", label: "Condition", subtitle: "Branch logic", icon: <GitBranch size={14} /> },
  { nodeType: "output", label: "Output", subtitle: "Final result", icon: <CircleDot size={14} /> },
];

/* ------------------------------------------------------------------ */
/*  Drag helpers                                                       */
/* ------------------------------------------------------------------ */

function onDragStart(e: DragEvent<HTMLDivElement>, entry: PaletteEntry) {
  // Store the palette item as JSON so the canvas drop handler can read it
  const item: PaletteItem = {
    nodeType: entry.nodeType,
    label: entry.label,
    subtitle: entry.subtitle,
  };
  e.dataTransfer.setData("application/llm-flow-node", JSON.stringify(item));
  e.dataTransfer.effectAllowed = "move";
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function PaletteSection({
  title,
  nodes,
}: {
  title: string;
  nodes: PaletteEntry[];
}) {
  return (
    <div>
      <h3 className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wide text-mute">
        {title}
      </h3>
      <div className="flex flex-col gap-0.5">
        {nodes.map((node) => (
          <div
            key={`${node.nodeType}-${node.label}`}
            draggable
            onDragStart={(e) => onDragStart(e, node)}
            className="flex cursor-grab items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-body transition-colors hover:border-hairline-soft hover:bg-surface-soft hover:text-ink active:cursor-grabbing"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-soft text-body">
              {node.icon}
            </span>
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface NodePaletteProps {
  className?: string;
  onClose?: () => void;
}

export function NodePalette({ className, onClose }: NodePaletteProps = {}) {
  return (
    <div className={className ?? "hidden w-48 shrink-0 flex-col gap-4 overflow-y-auto border-r border-hairline bg-surface-card p-3 lg:flex"}>
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold text-ink">Nodes</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink lg:hidden"
            aria-label="Close palette"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <PaletteSection title="LLMs" nodes={llmNodes} />
      <PaletteSection title="Image Gen" nodes={imageNodes} />
      <PaletteSection title="Tools" nodes={toolNodes} />
      <PaletteSection title="Logic" nodes={logicNodes} />
    </div>
  );
}
