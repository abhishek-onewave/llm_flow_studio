"use client";

import { useReducer, useSyncExternalStore } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow/store";

const STORAGE_KEY = "llm-flow-studio-workflow";

interface SavedWorkflow {
  workflowName: string;
  nodeCount: number;
  edgeCount: number;
}

function readSaved(): SavedWorkflow | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.nodes?.length) {
      return {
        workflowName: parsed.workflowName ?? "Untitled Workflow",
        nodeCount: parsed.nodes.length,
        edgeCount: parsed.edges?.length ?? 0,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function WorkflowsPage() {
  const [, forceRefresh] = useReducer((x: number) => x + 1, 0);
  const saved = useSyncExternalStore(
    () => () => {},
    readSaved,
    () => null,
  );
  const resetNew = useWorkflowStore((s) => s.resetToNewWorkflow);

  function handleDelete() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    resetNew();
    forceRefresh();
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-mute">Workflows</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Manage your AI workflow pipelines.</h1>
        </div>
        <Link
          href="/workflows/builder?new=1"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-primary-cta px-3 text-xs font-bold text-on-primary transition-colors hover:bg-primary-pressed sm:h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          New workflow
        </Link>
      </div>

      {/* Workflow list */}
      <div className="mt-6">
        {saved ? (
          <div className="rounded-md border border-hairline bg-surface-card">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/workflows/builder" className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                <div>
                  <p className="text-sm font-semibold text-ink">{saved.workflowName}</p>
                  <p className="mt-0.5 text-[11px] text-mute">
                    {saved.nodeCount} nodes &middot; {saved.edgeCount} connections
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mute transition-colors hover:bg-accent-red-soft hover:text-accent-red"
                  title="Delete workflow"
                  aria-label="Delete workflow"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link
                  href="/workflows/builder"
                  className={cn(
                    "inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink",
                  )}
                >
                  Open
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-hairline-soft bg-surface-soft px-6 py-10 text-center">
            <p className="text-sm text-mute">No workflows yet. Create your first one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
