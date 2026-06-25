import type { WorkflowNodeData } from "@/components/workflow/canvas-node";

/* ------------------------------------------------------------------ */
/*  Palette item definition                                            */
/* ------------------------------------------------------------------ */

export interface PaletteItem {
  /** Internal node type key used for colorKey and default lookup */
  nodeType: string;
  /** Display label shown on the palette and the new node */
  label: string;
  /** Provider label for subtitle (LLM nodes) or category */
  subtitle: string;
}

/* ------------------------------------------------------------------ */
/*  Default data factory per palette nodeType                          */
/* ------------------------------------------------------------------ */

const defaults: Record<string, Omit<WorkflowNodeData, "label" | "subtitle" | "colorKey">> = {
  /* LLM nodes */
  openai: {
    status: "idle",
    config: { provider: "openai", model: "gpt-4o", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },
  anthropic: {
    status: "idle",
    config: { provider: "anthropic", model: "claude-sonnet-4", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },
  google: {
    status: "idle",
    config: { provider: "google", model: "gemini-2.5-pro", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },
  mistral: {
    status: "idle",
    config: { provider: "mistral", model: "mistral-large", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },
  openrouter: {
    status: "idle",
    config: { provider: "openrouter", model: "auto", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },
  custom: {
    status: "idle",
    config: { provider: "custom", model: "custom-model", instructions: "", promptTemplate: "{{input}}", temperature: 0.7, maxTokens: 4096, outputFormat: "text" },
  },

  /* Image generation nodes */
  openai_image: {
    status: "idle",
    config: { provider: "openai", model: "dall-e-3", promptTemplate: "{{input}}", size: "1024x1024", quality: "standard", outputType: "image" },
  },
  google_image: {
    status: "idle",
    config: { provider: "google", model: "gemini-2.5-flash-image", promptTemplate: "{{input}}", size: "1024x1024", quality: "standard", outputType: "image" },
  },

  /* Tool nodes */
  file_reader: {
    status: "idle",
    config: { source: "upload", filePath: "" },
  },
  file_writer: {
    status: "idle",
    config: { destination: "download", filePath: "", format: "text" },
  },
  github: {
    status: "idle",
    config: { operation: "read_file", repo: "", branch: "main", path: "" },
  },
  vercel: {
    status: "idle",
    config: { operation: "deploy", project: "", environment: "preview" },
  },
  database: {
    status: "idle",
    config: { connection: "postgresql://", query: "SELECT 1" },
  },
  http_api: {
    status: "idle",
    config: { method: "GET", url: "https://", headers: "{}", body: "" },
  },
  web_search: {
    status: "idle",
    config: { engine: "google", query: "" },
  },
  code_executor: {
    status: "idle",
    config: { language: "javascript", code: "" },
  },

  /* Logic nodes */
  human_approval: {
    status: "idle",
    config: { prompt: "Approve to continue?" },
  },
  condition: {
    status: "idle",
    config: { field: "", operator: "equals", value: "", trueBranch: "", falseBranch: "" },
  },
  output: {
    status: "idle",
    config: { format: "json" },
  },

  /* Input node */
  input: {
    status: "idle",
    config: { source: "text" },
  },
};

/* ------------------------------------------------------------------ */
/*  Build full node data from a palette item                           */
/* ------------------------------------------------------------------ */

export function buildNodeData(item: PaletteItem): WorkflowNodeData {
  const base = defaults[item.nodeType] ?? { status: "idle" as const };
  return {
    label: item.label,
    subtitle: item.subtitle,
    colorKey: item.nodeType,
    ...base,
  };
}
