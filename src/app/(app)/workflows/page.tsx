"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { listSavedWorkflows, deleteSavedWorkflow, type WorkflowIndexEntry } from "@/lib/workflow/store";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowIndexEntry[]>(() => listSavedWorkflows());

  // Refresh when tab regains focus (user may have saved in builder tab)
  useEffect(() => {
    const refresh = () => setWorkflows(listSavedWorkflows());
    window.addEventListener("focus", refresh);
    const onVisible = () => { if (document.visibilityState === "visible") setWorkflows(listSavedWorkflows()); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function handleDelete(id: string) {
    deleteSavedWorkflow(id);
    setWorkflows(listSavedWorkflows());
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
      <div className="mt-6 flex flex-col gap-2">
        {workflows.length > 0 ? (
          workflows.map((wf) => (
            <div key={wf.id} className="rounded-md border border-hairline bg-surface-card">
              <div className="flex items-center justify-between px-4 py-3">
                <Link
                  href={`/workflows/builder?id=${wf.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{wf.name}</p>
                    <p className="mt-0.5 text-[11px] text-mute">
                      {wf.nodeCount} nodes &middot; {wf.edgeCount} connections
                      {wf.updatedAt && (
                        <>
                          {" "}&middot;{" "}
                          {new Date(wf.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(wf.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mute transition-colors hover:bg-accent-red-soft hover:text-accent-red"
                    title="Delete workflow"
                    aria-label="Delete workflow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href={`/workflows/builder?id=${wf.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink"
                  >
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-hairline-soft bg-surface-soft px-6 py-10 text-center">
            <p className="text-sm text-mute">No workflows yet. Create your first one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
