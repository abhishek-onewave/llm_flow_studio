"use client";

import { useEffect, useState, useCallback } from "react";
import { PanelLeft, PanelRight } from "lucide-react";
import {
  BuilderToolbar,
  NodePalette,
  WorkflowCanvas,
  NodeInspector,
  RunConsole,
} from "@/components/workflow";
import { useWorkflowStore } from "@/lib/workflow/store";

export default function WorkflowBuilderPage() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const load = useWorkflowStore((s) => s.loadFromLocalStorage);

  const [showPalette, setShowPalette] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  useEffect(() => { load(); }, [load]);

  const closePalette = useCallback(() => setShowPalette(false), []);
  const closeInspector = useCallback(() => setShowInspector(false), []);

  return (
    <div className="flex h-full flex-col">
      <BuilderToolbar />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop palette (always visible on lg+) */}
        <NodePalette />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <WorkflowCanvas />
          <RunConsole />
        </div>

        {/* Desktop inspector (always visible on lg+) */}
        <NodeInspector selectedNodeId={selectedNodeId} />

        {/* ── Mobile toggle buttons (visible below lg) ── */}
        <button
          onClick={() => setShowPalette(true)}
          className="absolute bottom-14 left-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-card text-body transition-colors hover:bg-surface-soft hover:text-ink lg:hidden"
          aria-label="Open node palette"
          title="Nodes"
        >
          <PanelLeft size={16} />
        </button>

        <button
          onClick={() => setShowInspector(true)}
          className="absolute bottom-14 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-card text-body transition-colors hover:bg-surface-soft hover:text-ink lg:hidden"
          aria-label="Open node inspector"
          title="Inspector"
        >
          <PanelRight size={16} />
        </button>

        {/* ── Mobile palette overlay ── */}
        {showPalette && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/20 lg:hidden"
              onClick={closePalette}
              aria-hidden="true"
            />
            <NodePalette
              className="absolute inset-y-0 left-0 z-40 flex w-56 flex-col gap-4 overflow-y-auto border-r border-hairline bg-surface-card p-3 lg:hidden"
              onClose={closePalette}
            />
          </>
        )}

        {/* ── Mobile inspector overlay ── */}
        {showInspector && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/20 lg:hidden"
              onClick={closeInspector}
              aria-hidden="true"
            />
            <NodeInspector
              selectedNodeId={selectedNodeId}
              className="absolute inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-hairline bg-surface-card lg:hidden"
              onClose={closeInspector}
            />
          </>
        )}
      </div>
    </div>
  );
}
