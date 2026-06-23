"use client";

import {
  Save,
  Share2,
  Play,
  Pause,
  Square,
  Check,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";
import { runWorkflow, pauseRun, resumeRun, stopRun } from "@/lib/workflow/runner";
import { cn } from "@/lib/utils";

export function BuilderToolbar() {
  const save = useWorkflowStore((s) => s.saveToLocalStorage);
  const reset = useWorkflowStore((s) => s.resetToSampleWorkflow);
  const runStatus = useWorkflowStore((s) => s.runStatus);

  const isRunning = runStatus === "running";
  const isPaused = runStatus === "queued"; // "queued" doubles as paused
  const isBusy = isRunning || isPaused;

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-hairline bg-surface-card px-4">
      {/* Left — workflow name & status */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-sm font-bold text-ink">Contract Review Chain</h1>
        {isBusy ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent-blue">
            <Loader2 size={12} className="animate-spin" />
            {isPaused ? "Paused" : "Running"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent-green">
            <Check size={12} />
            {runStatus === "completed" ? "Completed" : "Saved"}
          </span>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto">
        <button
          onClick={reset}
          disabled={isBusy}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
            isBusy
              ? "cursor-not-allowed text-stone"
              : "text-body hover:bg-surface-soft hover:text-ink"
          )}
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-body transition-colors hover:bg-surface-soft hover:text-ink">
          <Share2 size={14} />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={save}
          disabled={isBusy}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
            isBusy
              ? "cursor-not-allowed text-stone"
              : "text-body hover:bg-surface-soft hover:text-ink"
          )}
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save</span>
        </button>

        <div className="mx-1 h-5 w-px bg-hairline-soft" />

        {/* Run / Resume button */}
        {isPaused ? (
          <button
            onClick={resumeRun}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent-green px-3 text-xs font-bold text-on-dark transition-colors hover:opacity-90"
          >
            <Play size={14} />
            Resume
          </button>
        ) : (
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition-colors",
              isRunning
                ? "cursor-not-allowed bg-surface-soft text-stone"
                : "bg-primary-cta text-on-primary hover:bg-primary-pressed"
            )}
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? "Running..." : "Run workflow"}
          </button>
        )}

        {/* Pause */}
        <button
          onClick={pauseRun}
          disabled={!isRunning}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            isRunning
              ? "text-body hover:bg-surface-soft hover:text-ink"
              : "cursor-not-allowed text-stone"
          )}
          title="Pause after current node"
          aria-label="Pause workflow"
        >
          <Pause size={14} />
        </button>

        {/* Stop */}
        <button
          onClick={stopRun}
          disabled={!isBusy}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            isBusy
              ? "text-accent-red hover:bg-accent-red-soft"
              : "cursor-not-allowed text-stone"
          )}
          title="Stop run"
          aria-label="Stop workflow"
        >
          <Square size={14} />
        </button>
      </div>
    </div>
  );
}
