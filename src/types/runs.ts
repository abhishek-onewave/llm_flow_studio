import type { NodeStatus } from "./workflow";

/** A single event in a run's log stream */
export interface RunEvent {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeLabel: string;
  type: "started" | "output_chunk" | "completed" | "error" | "skipped";
  message: string;
}

/** Execution record for one node within a run */
export interface NodeRun {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: NodeStatus;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  output: string | null;
  error: string | null;
  tokenCount: number | null;
}

/** A complete workflow execution record */
export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: NodeStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  totalTokens: number;
  estimatedCost: number;
  nodeRuns: NodeRun[];
  events: RunEvent[];
}

/** Summary for run history lists */
export interface RunSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  status: NodeStatus;
  startedAt: string;
  durationMs: number | null;
  totalTokens: number;
  estimatedCost: number;
}
