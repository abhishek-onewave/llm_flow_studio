import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  MarkerType,
} from "@xyflow/react";
import type { WorkflowNode } from "@/components/workflow/canvas-node";
import type { RunEvent } from "@/types/runs";
import type { NodeStatus, NodeConfig } from "@/types/workflow";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const OLD_STORAGE_KEY = "llm-flow-studio-workflow";
const INDEX_KEY = "llm-flow-studio-workflows";
const DATA_PREFIX = "llm-flow-studio-wf-";

const edgeStyle = { stroke: "#bfc1b7", strokeWidth: 1.5 };
const edgeMarker = {
  type: MarkerType.ArrowClosed as const,
  color: "#bfc1b7",
  width: 16,
  height: 16,
};

/* ------------------------------------------------------------------ */
/*  Multi-workflow localStorage helpers                                */
/* ------------------------------------------------------------------ */

export interface WorkflowIndexEntry {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  updatedAt: string;
}

type WorkflowPayload = {
  workflowName: string;
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: WorkflowNode["data"] }>;
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }>;
};

function generateWorkflowId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readIndex(): WorkflowIndexEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkflowIndexEntry[];
  } catch {
    return [];
  }
}

function writeIndex(index: WorkflowIndexEntry[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch { /* quota exceeded */ }
}

function readWorkflowData(id: string): WorkflowPayload | null {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as WorkflowPayload;
  } catch {
    return null;
  }
}

function writeWorkflowData(id: string, payload: WorkflowPayload) {
  try {
    localStorage.setItem(DATA_PREFIX + id, JSON.stringify(payload));
  } catch { /* quota exceeded */ }
}

function removeWorkflowData(id: string) {
  try {
    localStorage.removeItem(DATA_PREFIX + id);
  } catch { /* ignore */ }
}

/** Migrate old single-key storage into multi-workflow format */
function migrateOldStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as WorkflowPayload;
    if (!parsed?.nodes?.length) {
      localStorage.removeItem(OLD_STORAGE_KEY);
      return;
    }
    const id = generateWorkflowId();
    const name = parsed.workflowName || "Untitled Workflow";
    writeWorkflowData(id, parsed);
    const index = readIndex();
    index.push({
      id,
      name,
      nodeCount: parsed.nodes.length,
      edgeCount: parsed.edges?.length ?? 0,
      updatedAt: new Date().toISOString(),
    });
    writeIndex(index);
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch { /* ignore corrupt data */ }
}

/** Public helper to list all saved workflows (used by workflows page) */
export function listSavedWorkflows(): WorkflowIndexEntry[] {
  migrateOldStorage();
  return readIndex();
}

/** Public helper to delete a workflow by ID (used by workflows page) */
export function deleteSavedWorkflow(id: string) {
  const index = readIndex().filter((w) => w.id !== id);
  writeIndex(index);
  removeWorkflowData(id);
}

/* ------------------------------------------------------------------ */
/*  Sample workflow                                                    */
/* ------------------------------------------------------------------ */

const sampleNodes: WorkflowNode[] = [
  {
    id: "n1",
    type: "workflow",
    position: { x: 300, y: 40 },
    data: { label: "Input File", subtitle: "File Reader", colorKey: "file_reader", status: "completed" },
  },
  {
    id: "n2",
    type: "workflow",
    position: { x: 300, y: 180 },
    data: { label: "OpenAI Summarizer", subtitle: "gpt-4o", colorKey: "openai", status: "completed" },
  },
  {
    id: "n3",
    type: "workflow",
    position: { x: 300, y: 320 },
    selected: true,
    data: { label: "Claude Risk Reviewer", subtitle: "claude-sonnet-4", colorKey: "anthropic", status: "completed" },
  },
  {
    id: "n4",
    type: "workflow",
    position: { x: 300, y: 460 },
    data: { label: "Gemini JSON Formatter", subtitle: "gemini-2.5-pro", colorKey: "google", status: "completed" },
  },
  {
    id: "n5",
    type: "workflow",
    position: { x: 300, y: 600 },
    data: { label: "Output", subtitle: "Final result", colorKey: "output", status: "completed" },
  },
];

const sampleEdges: Edge[] = [
  { id: "e1-2", source: "n1", target: "n2", type: "deletable", style: edgeStyle, markerEnd: edgeMarker },
  { id: "e2-3", source: "n2", target: "n3", type: "deletable", style: edgeStyle, markerEnd: edgeMarker },
  { id: "e3-4", source: "n3", target: "n4", type: "deletable", style: edgeStyle, markerEnd: edgeMarker },
  { id: "e4-5", source: "n4", target: "n5", type: "deletable", style: edgeStyle, markerEnd: edgeMarker },
];

/* ------------------------------------------------------------------ */
/*  Store types                                                        */
/* ------------------------------------------------------------------ */

interface WorkflowState {
  /* Data */
  workflowId: string | null;
  workflowName: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  runStatus: NodeStatus;
  runEvents: RunEvent[];
  nodeOutputs: Record<string, string>;

  /* Node CRUD */
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<WorkflowNode["data"]>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  /* React Flow callbacks */
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  /* Config / status */
  updateNodeConfig: (id: string, config: Partial<NodeConfig>) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;

  /* Run events */
  appendRunEvent: (event: RunEvent) => void;

  /* Human approval */
  pendingApproval: { nodeId: string; nodeLabel: string } | null;
  approvalResult: "approved" | "rejected" | null;
  requestApproval: (nodeId: string, nodeLabel: string) => void;
  approveNode: () => void;
  rejectNode: () => void;

  /* Workflow name */
  setWorkflowName: (name: string) => void;

  /* Persistence — multi-workflow */
  saveWorkflow: () => void;
  saveWorkflowAs: (name: string) => void;
  loadWorkflow: (id: string) => void;
  deleteWorkflow: (id: string) => void;

  /* Legacy compat (used by auto-save) */
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  resetToSampleWorkflow: () => void;
  resetToNewWorkflow: (name?: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  /* ── Initial state ──────────────────────────────────────────────── */
  workflowId: null,
  workflowName: "Contract Review Chain",
  nodes: sampleNodes,
  edges: sampleEdges,
  selectedNodeId: "n3",
  runStatus: "idle",
  runEvents: [],
  nodeOutputs: {},
  pendingApproval: null,
  approvalResult: null,

  /* ── Node CRUD ──────────────────────────────────────────────────── */

  addNode: (node) =>
    set((s) => ({ nodes: [...s.nodes, node] })),

  updateNode: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  deleteNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  /* ── React Flow callbacks ───────────────────────────────────────── */

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes),
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges),
    })),

  onConnect: (connection) =>
    set((s) => ({
      edges: [
        ...s.edges,
        {
          id: `e-${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
          type: "deletable",
          style: edgeStyle,
          markerEnd: edgeMarker,
        },
      ],
    })),

  /* ── Config / status ────────────────────────────────────────────── */

  updateNodeConfig: (id, config) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== id) return n;
        const existing = (n.data as Record<string, unknown>).config ?? {};
        return { ...n, data: { ...n.data, config: { ...Object.assign({}, existing), ...config } } };
      }),
    })),

  setNodeStatus: (id, status) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, status } } : n
      ),
    })),

  /* ── Run events ─────────────────────────────────────────────────── */

  appendRunEvent: (event) =>
    set((s) => ({ runEvents: [...s.runEvents, event] })),

  /* ── Human approval ────────────────────────────────────────────── */

  requestApproval: (nodeId, nodeLabel) =>
    set({ pendingApproval: { nodeId, nodeLabel }, approvalResult: null }),

  approveNode: () =>
    set({ pendingApproval: null, approvalResult: "approved" }),

  rejectNode: () =>
    set({ pendingApproval: null, approvalResult: "rejected" }),

  /* ── Workflow name ───────────────────────────────────────────────── */

  setWorkflowName: (name) => set({ workflowName: name }),

  /* ── Multi-workflow persistence ──────────────────────────────────── */

  saveWorkflow: () => {
    const { nodes, edges, workflowName, workflowId } = get();
    const payload: WorkflowPayload = {
      workflowName,
      nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
      edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
        id, source, target, sourceHandle: sourceHandle ?? undefined, targetHandle: targetHandle ?? undefined,
      })),
    };

    if (workflowId) {
      // Update existing
      writeWorkflowData(workflowId, payload);
      const index = readIndex().map((w) =>
        w.id === workflowId
          ? { ...w, name: workflowName, nodeCount: nodes.length, edgeCount: edges.length, updatedAt: new Date().toISOString() }
          : w,
      );
      writeIndex(index);
    } else {
      // First save — generate new ID
      const newId = generateWorkflowId();
      writeWorkflowData(newId, payload);
      const index = readIndex();
      index.unshift({
        id: newId,
        name: workflowName,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        updatedAt: new Date().toISOString(),
      });
      writeIndex(index);
      set({ workflowId: newId });
    }
  },

  saveWorkflowAs: (name) => {
    const { nodes, edges } = get();
    const newId = generateWorkflowId();
    const payload: WorkflowPayload = {
      workflowName: name,
      nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
      edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
        id, source, target, sourceHandle: sourceHandle ?? undefined, targetHandle: targetHandle ?? undefined,
      })),
    };
    writeWorkflowData(newId, payload);
    const index = readIndex();
    index.unshift({
      id: newId,
      name,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      updatedAt: new Date().toISOString(),
    });
    writeIndex(index);
    set({ workflowId: newId, workflowName: name });
  },

  loadWorkflow: (id) => {
    const data = readWorkflowData(id);
    if (!data || !data.nodes?.length) return;
    set({
      workflowId: id,
      workflowName: data.workflowName ?? "Untitled Workflow",
      nodes: data.nodes.map((n) => ({
        ...n,
        type: n.type ?? "workflow",
      })) as WorkflowNode[],
      edges: data.edges.map((e) => ({
        ...e,
        type: "deletable",
        style: edgeStyle,
        markerEnd: edgeMarker,
      })),
      selectedNodeId: null,
      runStatus: "idle",
      runEvents: [],
      nodeOutputs: {},
    });
  },

  deleteWorkflow: (id) => {
    deleteSavedWorkflow(id);
    if (get().workflowId === id) {
      get().resetToNewWorkflow();
    }
  },

  /* ── Legacy compat (saveToLocalStorage used by auto-save) ────────── */

  saveToLocalStorage: () => {
    // Redirect to new multi-workflow save, but only if already saved once
    const { workflowId } = get();
    if (workflowId) {
      get().saveWorkflow();
    }
  },

  loadFromLocalStorage: () => {
    // Migrate old data then no-op (builder page uses loadWorkflow now)
    migrateOldStorage();
  },

  resetToSampleWorkflow: () => {
    set({
      workflowId: null,
      workflowName: "Contract Review Chain",
      nodes: sampleNodes,
      edges: sampleEdges,
      selectedNodeId: "n3",
      runStatus: "idle",
      runEvents: [],
      nodeOutputs: {},
    });
  },

  resetToNewWorkflow: (name) => {
    const inputNode: WorkflowNode = {
      id: "n-input",
      type: "workflow",
      position: { x: 300, y: 100 },
      data: { label: "Input", subtitle: "Start", colorKey: "input", status: "idle" },
    };
    const outputNode: WorkflowNode = {
      id: "n-output",
      type: "workflow",
      position: { x: 300, y: 300 },
      data: { label: "Output", subtitle: "End", colorKey: "output", status: "idle" },
    };
    const edge: Edge = {
      id: "e-input-output",
      source: "n-input",
      target: "n-output",
      type: "deletable",
      style: edgeStyle,
      markerEnd: edgeMarker,
    };
    set({
      workflowId: null,
      workflowName: name ?? "Untitled Workflow",
      nodes: [inputNode, outputNode],
      edges: [edge],
      selectedNodeId: null,
      runStatus: "idle",
      runEvents: [],
      nodeOutputs: {},
    });
  },
}));
