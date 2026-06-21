/**
 * Mock workflow execution engine.
 *
 * Simulates node-by-node execution with streaming output, token counts,
 * durations, and costs. All data is fake — no real API calls.
 */

import { useWorkflowStore } from "./store";
import type { WorkflowNode } from "@/components/workflow/canvas-node";
import type { Edge } from "@xyflow/react";

/* ------------------------------------------------------------------ */
/*  Mock outputs by colorKey                                           */
/* ------------------------------------------------------------------ */

const mockOutputs: Record<string, string> = {
  file_reader: `[Document Summary]
Parsed contract.pdf — 12 pages, 4,820 words.
Sections: Definitions, Obligations, Payment Terms,
Liability, Non-Compete, IP Assignment, Termination.
Uploaded at: 2025-06-21T14:20:00Z`,

  openai: `**Professional Summary**

Key Terms Extracted:
1. Payment terms: Net 30 from invoice date
2. Liability cap: $500,000 aggregate
3. Non-compete: 12 months, North America
4. IP assignment: All work product assigned to Client
5. Termination: 30 days written notice, cause immediate

Confidence: HIGH | Tokens used: 6,200`,

  anthropic: `[
  {
    "risk": "Non-compete clause",
    "severity": "HIGH",
    "detail": "Overly broad geographic and temporal scope. 12-month restriction across all of North America exceeds typical enforceability thresholds.",
    "recommendation": "Narrow to specific metro area or 6-month term."
  },
  {
    "risk": "Liability cap insufficient",
    "severity": "MEDIUM",
    "detail": "$500k aggregate may be insufficient for the scope of services described. Industry standard is 2x annual contract value.",
    "recommendation": "Increase to $1M or add per-incident sub-limits."
  },
  {
    "risk": "IP assignment — no pre-existing IP carve-out",
    "severity": "HIGH",
    "detail": "Clause assigns ALL work product without excluding pre-existing IP. This could inadvertently transfer contractor's existing tools/libraries.",
    "recommendation": "Add Schedule B listing pre-existing IP exclusions."
  }
]`,

  google: `{
  "report": {
    "title": "Contract Risk Assessment",
    "date": "2025-06-21",
    "total_risks": 3,
    "high_severity": 2,
    "medium_severity": 1,
    "risks": [
      { "id": 1, "severity": "HIGH", "category": "Non-compete" },
      { "id": 2, "severity": "MEDIUM", "category": "Liability" },
      { "id": 3, "severity": "HIGH", "category": "IP Assignment" }
    ],
    "recommendation": "Legal review recommended before signing."
  }
}`,

  mistral: `## Analysis Complete

Processed contract through Mistral Large model.
Identified key compliance issues and summarized findings.
Output tokens: 3,400 | Latency: 2.1s`,

  output: `✅ Workflow Complete

Final contract risk assessment delivered.
- 3 risks identified (2 HIGH, 1 MEDIUM)
- Recommended actions attached
- Total processing: 18,420 tokens | $0.29 | 3m 5s

Report saved to output buffer.`,

  // Generic fallback for any other node type
  _default: `Node execution completed successfully.
Output generated at ${new Date().toISOString()}.
Mock data — no real API call was made.`,
};

/* ------------------------------------------------------------------ */
/*  Mock stats by colorKey                                             */
/* ------------------------------------------------------------------ */

interface MockStats {
  tokens: number;
  durationMs: number;
  cost: number;
}

const mockStats: Record<string, MockStats> = {
  file_reader: { tokens: 0, durationMs: 1200, cost: 0 },
  openai: { tokens: 6200, durationMs: 4800, cost: 0.08 },
  anthropic: { tokens: 7100, durationMs: 8400, cost: 0.12 },
  google: { tokens: 5120, durationMs: 3200, cost: 0.09 },
  mistral: { tokens: 3400, durationMs: 2100, cost: 0.04 },
  output: { tokens: 0, durationMs: 200, cost: 0 },
  _default: { tokens: 1000, durationMs: 1500, cost: 0.02 },
};

/* ------------------------------------------------------------------ */
/*  Topology helpers                                                   */
/* ------------------------------------------------------------------ */

/** Topological sort using Kahn's algorithm. Returns node IDs in execution order. */
export function topoSort(nodes: WorkflowNode[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  for (const n of nodes) {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  }
  for (const e of edges) {
    adj[e.source]?.push(e.target);
    inDegree[e.target] = (inDegree[e.target] ?? 0) + 1;
  }
  const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
  const sorted: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(id);
    for (const next of adj[id] ?? []) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return sorted;
}

/** Get downstream node IDs from a starting node (inclusive). */
export function getDownstream(startId: string, nodes: WorkflowNode[], edges: Edge[]): string[] {
  const adj: Record<string, string[]> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) adj[e.source]?.push(e.target);

  const visited = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const next of adj[id] ?? []) queue.push(next);
  }

  // Return in topological order
  const order = topoSort(nodes, edges);
  return order.filter((id) => visited.has(id));
}

/* ------------------------------------------------------------------ */
/*  Streaming simulation                                               */
/* ------------------------------------------------------------------ */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulate streaming output character-by-character into the store. */
async function streamOutput(
  nodeId: string,
  text: string,
  signal: AbortSignal,
): Promise<boolean> {
  const store = useWorkflowStore.getState;
  const chunkSize = 8; // characters per tick
  const tickMs = 30; // ms between ticks

  for (let i = 0; i < text.length; i += chunkSize) {
    if (signal.aborted) return false;

    // Check pause
    while (store().runStatus === "queued") {
      // "queued" used as "paused" state
      await sleep(100);
      if (signal.aborted) return false;
    }

    const chunk = text.slice(0, i + chunkSize);
    useWorkflowStore.setState((s) => ({
      nodeOutputs: { ...s.nodeOutputs, [nodeId]: chunk },
    }));
    await sleep(tickMs);
  }

  // Final full output
  useWorkflowStore.setState((s) => ({
    nodeOutputs: { ...s.nodeOutputs, [nodeId]: text },
  }));
  return true;
}

/* ------------------------------------------------------------------ */
/*  Event helper                                                       */
/* ------------------------------------------------------------------ */

let eventCounter = 0;

function emitEvent(
  nodeId: string,
  nodeLabel: string,
  type: "started" | "output_chunk" | "completed" | "error" | "skipped",
  message: string,
) {
  const now = new Date();
  const ts = now.toTimeString().slice(0, 8);
  useWorkflowStore.getState().appendRunEvent({
    id: `evt-${++eventCounter}`,
    timestamp: ts,
    nodeId,
    nodeLabel,
    type,
    message,
  });
}

/* ------------------------------------------------------------------ */
/*  Run a single node                                                  */
/* ------------------------------------------------------------------ */

async function executeSingleNode(
  node: WorkflowNode,
  signal: AbortSignal,
): Promise<boolean> {
  const { setNodeStatus } = useWorkflowStore.getState();
  const colorKey = node.data.colorKey;
  const stats = mockStats[colorKey] ?? mockStats._default;
  const output = mockOutputs[colorKey] ?? mockOutputs._default;

  // Mark running
  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", `Starting ${node.data.label}...`);

  // Simulate processing delay (proportional to mock duration)
  const preStreamDelay = Math.min(stats.durationMs * 0.3, 800);
  await sleep(preStreamDelay);
  if (signal.aborted) return false;

  // Stream output
  const ok = await streamOutput(node.id, output, signal);
  if (!ok) return false;

  // Mark completed
  setNodeStatus(node.id, "completed");

  const tokenStr = stats.tokens > 0 ? `${stats.tokens.toLocaleString()} tokens` : "no tokens";
  const durStr = `${(stats.durationMs / 1000).toFixed(1)}s`;
  const costStr = stats.cost > 0 ? `$${stats.cost.toFixed(2)}` : "free";
  emitEvent(
    node.id,
    node.data.label,
    "completed",
    `Completed in ${durStr}. ${tokenStr}, ${costStr}.`,
  );

  // Post-node pause
  await sleep(200);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Public execution API                                               */
/* ------------------------------------------------------------------ */

let currentAbort: AbortController | null = null;

/** Run the full workflow in topological order. */
export async function runWorkflow(): Promise<void> {
  const store = useWorkflowStore.getState();
  if (store.runStatus === "running") return;

  // Abort previous if any
  currentAbort?.abort();
  const abort = new AbortController();
  currentAbort = abort;

  const { nodes, edges, setNodeStatus } = store;

  // Clear previous run
  useWorkflowStore.setState({ runEvents: [], runStatus: "running", nodeOutputs: {} });

  // Reset all statuses to idle first, then queue
  const order = topoSort(nodes, edges);
  for (const id of order) setNodeStatus(id, "idle");
  for (const id of order) setNodeStatus(id, "queued");

  emitEvent("workflow", "Workflow", "started", "Workflow execution started.");

  for (const id of order) {
    if (abort.signal.aborted) break;

    // Pause check
    while (useWorkflowStore.getState().runStatus === "queued") {
      await sleep(100);
      if (abort.signal.aborted) break;
    }
    if (abort.signal.aborted) break;

    const node = useWorkflowStore.getState().nodes.find((n) => n.id === id);
    if (!node) continue;

    const ok = await executeSingleNode(node, abort.signal);
    if (!ok) break;
  }

  if (abort.signal.aborted) {
    // Mark remaining queued nodes as skipped
    const currentNodes = useWorkflowStore.getState().nodes;
    for (const n of currentNodes) {
      if (n.data.status === "queued" || n.data.status === "running") {
        setNodeStatus(n.id, "skipped");
        emitEvent(n.id, n.data.label, "skipped", "Skipped — run was stopped.");
      }
    }
    emitEvent("workflow", "Workflow", "error", "Workflow execution stopped.");
    useWorkflowStore.setState({ runStatus: "idle" });
  } else {
    emitEvent("workflow", "Workflow", "completed", "Workflow execution completed successfully.");
    useWorkflowStore.setState({ runStatus: "completed" });
  }
}

/** Run a single node by ID. */
export async function runSingleNode(nodeId: string): Promise<void> {
  const store = useWorkflowStore.getState();
  if (store.runStatus === "running") return;

  currentAbort?.abort();
  const abort = new AbortController();
  currentAbort = abort;

  useWorkflowStore.setState({ runStatus: "running" });

  const node = store.nodes.find((n) => n.id === nodeId);
  if (!node) {
    useWorkflowStore.setState({ runStatus: "idle" });
    return;
  }

  await executeSingleNode(node, abort.signal);

  if (!abort.signal.aborted) {
    useWorkflowStore.setState({ runStatus: "idle" });
  }
}

/** Run downstream nodes from a starting node (inclusive). */
export async function runDownstream(startId: string): Promise<void> {
  const store = useWorkflowStore.getState();
  if (store.runStatus === "running") return;

  currentAbort?.abort();
  const abort = new AbortController();
  currentAbort = abort;

  const { nodes, edges, setNodeStatus } = store;

  useWorkflowStore.setState({ runStatus: "running" });

  const downstream = getDownstream(startId, nodes, edges);
  for (const id of downstream) setNodeStatus(id, "queued");

  emitEvent("workflow", "Workflow", "started", `Running downstream from ${store.nodes.find((n) => n.id === startId)?.data.label ?? startId}.`);

  for (const id of downstream) {
    if (abort.signal.aborted) break;

    const node = useWorkflowStore.getState().nodes.find((n) => n.id === id);
    if (!node) continue;

    const ok = await executeSingleNode(node, abort.signal);
    if (!ok) break;
  }

  if (abort.signal.aborted) {
    const currentNodes = useWorkflowStore.getState().nodes;
    for (const n of currentNodes) {
      if (n.data.status === "queued" || n.data.status === "running") {
        setNodeStatus(n.id, "skipped");
      }
    }
    useWorkflowStore.setState({ runStatus: "idle" });
  } else {
    emitEvent("workflow", "Workflow", "completed", "Downstream execution completed.");
    useWorkflowStore.setState({ runStatus: "idle" });
  }
}

/** Pause the current run (completes current node, then waits). */
export function pauseRun(): void {
  if (useWorkflowStore.getState().runStatus === "running") {
    useWorkflowStore.setState({ runStatus: "queued" }); // "queued" = paused
    emitEvent("workflow", "Workflow", "started", "Execution paused.");
  }
}

/** Resume a paused run. */
export function resumeRun(): void {
  if (useWorkflowStore.getState().runStatus === "queued") {
    useWorkflowStore.setState({ runStatus: "running" });
    emitEvent("workflow", "Workflow", "started", "Execution resumed.");
  }
}

/** Stop the current run entirely. */
export function stopRun(): void {
  currentAbort?.abort();
  currentAbort = null;
  // The cleanup happens in the run loop's abort handler
}
