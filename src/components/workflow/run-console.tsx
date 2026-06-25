"use client";

import { useState, useEffect, useRef } from "react";
// useEffect and useRef kept for scroll
import { ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow/store";
import { OutputRenderer, isMediaOutput } from "./output-renderer";

const consoleTabs = ["Run Logs", "Console", "Environment"] as const;

/** Reactively renders media output for a node in the console */
function ConsoleMediaOutput({ nodeId }: { nodeId: string }) {
  const output = useWorkflowStore((s) => s.nodeOutputs[nodeId]);
  if (!output || !isMediaOutput(output)) return null;
  return <OutputRenderer output={output} compact />;
}

export function RunConsole() {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof consoleTabs)[number]>("Run Logs");
  const runEvents = useWorkflowStore((s) => s.runEvents);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [runEvents.length]);

  return (
    <div
      className={cn(
        "shrink-0 border-t border-hairline bg-surface-card transition-all",
        expanded ? "h-44" : "h-9"
      )}
    >
      {/* Header */}
      <div className="flex h-9 items-center justify-between border-b border-hairline-soft px-4">
        <div className="flex items-center gap-1" role="tablist">
          {consoleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeTab === tab
                  ? "bg-surface-soft text-ink"
                  : "text-mute hover:text-body"
              )}
            >
              {tab}
              {tab === "Run Logs" && runEvents.length > 0 && (
                <span className="ml-1 text-[10px] text-mute">({runEvents.length})</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Copy output"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={() => useWorkflowStore.setState({ runEvents: [] })}
            aria-label="Clear console"
            className="inline-flex h-6 w-6 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse console" : "Expand console"}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-mute hover:bg-surface-soft hover:text-ink"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Log content */}
      {expanded && (
        <div ref={logRef} role="tabpanel" className="h-[calc(100%-36px)] overflow-y-auto px-4 py-2">
          {activeTab === "Run Logs" && (
            <div className="flex flex-col gap-0.5 font-mono text-[11px]">
              {runEvents.length === 0 ? (
                <p className="text-mute">No run events yet. Click &quot;Run workflow&quot; to start.</p>
              ) : (
                runEvents.map((ev) => (
                  <div key={ev.id} className="flex gap-3">
                    <span className="shrink-0 text-mute">{ev.timestamp}</span>
                    <span className="shrink-0 w-40 truncate font-medium text-body">
                      {ev.nodeLabel}
                    </span>
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
                    {ev.type === "completed" && <ConsoleMediaOutput nodeId={ev.nodeId} />}
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === "Console" && (
            <p className="text-[11px] text-mute">No console output.</p>
          )}
          {activeTab === "Environment" && (
            <div className="flex flex-col gap-1 font-mono text-[11px]">
              <div className="flex gap-2">
                <span className="text-mute">OPENAI_API_KEY</span>
                <span className="text-body">sk-•••••••••••••mock</span>
              </div>
              <div className="flex gap-2">
                <span className="text-mute">ANTHROPIC_API_KEY</span>
                <span className="text-body">sk-ant-•••••••mock</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
