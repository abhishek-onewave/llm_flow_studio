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

const STORAGE_KEY = "llm-flow-studio-workflow";

const edgeStyle = { stroke: "#bfc1b7", strokeWidth: 1.5 };
const edgeMarker = {
  type: MarkerType.ArrowClosed as const,
  color: "#bfc1b7",
  width: 16,
  height: 16,
};

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

  /* Workflow name */
  setWorkflowName: (name: string) => void;

  /* Persistence */
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
  workflowName: "Contract Review Chain",
  nodes: sampleNodes,
  edges: sampleEdges,
  selectedNodeId: "n3",
  runStatus: "idle",
  runEvents: [],
  nodeOutputs: {},

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

  /* ── Workflow name ───────────────────────────────────────────────── */

  setWorkflowName: (name) => set({ workflowName: name }),

  /* ── Persistence ────────────────────────────────────────────────── */

  saveToLocalStorage: () => {
    const { nodes, edges, workflowName } = get();
    const payload = {
      workflowName,
      nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
      edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
        id, source, target, sourceHandle, targetHandle,
      })),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* quota exceeded or SSR — silently ignore */
    }
  },

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        workflowName?: string;
        nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: WorkflowNode["data"] }>;
        edges: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }>;
      };
      if (!parsed.nodes?.length) return;
      set({
        workflowName: parsed.workflowName ?? "Untitled Workflow",
        nodes: parsed.nodes.map((n) => ({
          ...n,
          type: n.type ?? "workflow",
        })) as WorkflowNode[],
        edges: parsed.edges.map((e) => ({
          ...e,
          type: "deletable",
          style: edgeStyle,
          markerEnd: edgeMarker,
        })),
      });
    } catch {
      /* corrupt data — silently ignore */
    }
  },

  resetToSampleWorkflow: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({
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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({
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
