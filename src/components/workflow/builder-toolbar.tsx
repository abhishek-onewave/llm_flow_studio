"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Save,
  Share2,
  Play,
  Pause,
  Square,
  Check,
  RotateCcw,
  Loader2,
  ChevronDown,
  Copy,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";
import { runWorkflow, pauseRun, resumeRun, stopRun } from "@/lib/workflow/runner";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Save-name modal                                                    */
/* ------------------------------------------------------------------ */

function SaveNameModal({
  defaultName,
  onSave,
  onCancel,
}: {
  defaultName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border border-hairline bg-surface-card p-3 shadow-sm">
      <label className="block text-[11px] font-semibold text-mute">Workflow name</label>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) onSave(name.trim());
          if (e.key === "Escape") onCancel();
        }}
        className="mt-1 w-full rounded-md border border-hairline bg-surface-soft px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary-cta"
        placeholder="Enter workflow name"
      />
      <div className="mt-2 flex items-center justify-end gap-1.5">
        <button
          onClick={onCancel}
          className="inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-medium text-body hover:bg-surface-soft"
        >
          Cancel
        </button>
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          className="inline-flex h-7 items-center rounded-md bg-primary-cta px-2.5 text-[11px] font-bold text-on-primary hover:bg-primary-pressed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toolbar                                                            */
/* ------------------------------------------------------------------ */

export function BuilderToolbar() {
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const saveWorkflow = useWorkflowStore((s) => s.saveWorkflow);
  const saveWorkflowAs = useWorkflowStore((s) => s.saveWorkflowAs);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const reset = useWorkflowStore((s) => s.resetToSampleWorkflow);
  const runStatus = useWorkflowStore((s) => s.runStatus);
  const workflowName = useWorkflowStore((s) => s.workflowName);

  const isRunning = runStatus === "running";
  const isPaused = runStatus === "queued"; // "queued" doubles as paused
  const isBusy = isRunning || isPaused;

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleSave = useCallback(() => {
    if (workflowId) {
      // Already saved before — update in place
      saveWorkflow();
    } else {
      // First time — ask for name
      setShowSaveModal(true);
    }
    setShowDropdown(false);
  }, [workflowId, saveWorkflow]);

  const handleSaveAs = useCallback(() => {
    setShowSaveAsModal(true);
    setShowDropdown(false);
  }, []);

  const handleSaveModalConfirm = useCallback((name: string) => {
    setWorkflowName(name);
    // Need to set name first, then save — use setTimeout to let state update
    setTimeout(() => {
      useWorkflowStore.getState().saveWorkflow();
    }, 0);
    setShowSaveModal(false);
  }, [setWorkflowName]);

  const handleSaveAsConfirm = useCallback((name: string) => {
    saveWorkflowAs(name);
    setShowSaveAsModal(false);
  }, [saveWorkflowAs]);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-hairline bg-surface-card px-4">
      {/* Left — workflow name & status */}
      <div className="flex min-w-0 items-center gap-3">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="truncate bg-transparent text-sm font-bold text-ink outline-none focus:underline focus:decoration-primary-cta"
          aria-label="Workflow name"
        />
        {isBusy ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent-blue">
            <Loader2 size={12} className="animate-spin" />
            {isPaused ? "Paused" : "Running"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent-green">
            <Check size={12} />
            {runStatus === "completed" ? "Completed" : workflowId ? "Saved" : "Unsaved"}
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

        {/* Save split button */}
        <div ref={dropdownRef} className="relative">
          <div className="flex items-center">
            <button
              onClick={handleSave}
              disabled={isBusy}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-l-md px-3 text-xs font-medium transition-colors",
                isBusy
                  ? "cursor-not-allowed text-stone"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              )}
            >
              <Save size={14} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              disabled={isBusy}
              className={cn(
                "inline-flex h-8 items-center rounded-r-md border-l border-hairline-soft px-1 transition-colors",
                isBusy
                  ? "cursor-not-allowed text-stone"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              )}
              aria-label="Save options"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-hairline bg-surface-card py-1 shadow-sm">
              <button
                onClick={handleSave}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-body hover:bg-surface-soft hover:text-ink"
              >
                <Save size={12} />
                {workflowId ? "Save" : "Save as..."}
              </button>
              <button
                onClick={handleSaveAs}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-body hover:bg-surface-soft hover:text-ink"
              >
                <Copy size={12} />
                Save as new...
              </button>
            </div>
          )}

          {/* Save name modal (first save) */}
          {showSaveModal && (
            <SaveNameModal
              defaultName={workflowName}
              onSave={handleSaveModalConfirm}
              onCancel={() => setShowSaveModal(false)}
            />
          )}

          {/* Save-as name modal */}
          {showSaveAsModal && (
            <SaveNameModal
              defaultName={workflowName + " Copy"}
              onSave={handleSaveAsConfirm}
              onCancel={() => setShowSaveAsModal(false)}
            />
          )}
        </div>

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
