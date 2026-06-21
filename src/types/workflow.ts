/** MVP node type identifiers */
export type NodeType =
  | "input"
  | "llm"
  | "file_reader"
  | "file_writer"
  | "github"
  | "vercel"
  | "database"
  | "http_api"
  | "web_search"
  | "code_executor"
  | "human_approval"
  | "condition"
  | "output";

/** LLM provider identifiers */
export type LLMProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "openrouter"
  | "custom";

/** Execution status for a node or workflow */
export type NodeStatus =
  | "idle"
  | "queued"
  | "running"
  | "completed"
  | "error"
  | "skipped";

/** Configuration for LLM-type nodes */
export interface LLMNodeConfig {
  provider: LLMProvider;
  model: string;
  instructions: string;
  promptTemplate: string;
  temperature: number;
  maxTokens: number;
  outputFormat: "text" | "json" | "markdown";
}

/** Configuration for tool-type nodes (non-LLM) */
export interface ToolNodeConfig {
  /** Tool-specific settings stored as key-value pairs */
  settings: Record<string, string | number | boolean>;
  /** Input field mapping: maps tool input names to upstream node output refs */
  inputMapping: Record<string, string>;
}

/** Configuration for condition nodes */
export interface ConditionNodeConfig {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "exists" | "regex";
  value: string;
  trueBranch: string;
  falseBranch: string;
}

/** Union of all possible node configuration shapes */
export type NodeConfig = LLMNodeConfig | ToolNodeConfig | ConditionNodeConfig;

/** Position on the canvas */
export interface Position {
  x: number;
  y: number;
}

/** A single node in a workflow */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  config: NodeConfig;
  /** Runtime status during execution */
  status: NodeStatus;
  /** Latest output from execution (mock or real) */
  output?: string;
}

/** A directed edge connecting two nodes */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

/** Top-level workflow definition */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

/** Summary shown in lists (dashboard, workflow index) */
export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  lastRunAt: string | null;
  lastRunStatus: NodeStatus | null;
  updatedAt: string;
  tags: string[];
}
