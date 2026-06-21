import { z } from "zod/v4";

export const llmNodeConfigSchema = z.object({
  provider: z.enum(["openai", "anthropic", "google", "mistral", "openrouter", "custom"]),
  model: z.string().min(1),
  instructions: z.string(),
  promptTemplate: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(1).max(200000),
  outputFormat: z.enum(["text", "json", "markdown"]),
});

export const toolNodeConfigSchema = z.object({
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  inputMapping: z.record(z.string(), z.string()),
});

export const conditionNodeConfigSchema = z.object({
  field: z.string(),
  operator: z.enum(["equals", "contains", "gt", "lt", "exists", "regex"]),
  value: z.string(),
  trueBranch: z.string(),
  falseBranch: z.string(),
});

export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "input", "llm", "file_reader", "file_writer", "github", "vercel",
    "database", "http_api", "web_search", "code_executor",
    "human_approval", "condition", "output",
  ]),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.union([llmNodeConfigSchema, toolNodeConfigSchema, conditionNodeConfigSchema]),
  status: z.enum(["idle", "queued", "running", "completed", "error", "skipped"]),
  output: z.string().optional(),
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
});
