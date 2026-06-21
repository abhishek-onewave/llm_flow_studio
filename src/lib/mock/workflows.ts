import type { Workflow, WorkflowSummary } from "@/types/workflow";

const llm = (provider: "openai" | "anthropic" | "google" | "mistral", model: string, instructions: string, prompt: string) => ({
  provider, model, instructions, promptTemplate: prompt,
  temperature: 0.7, maxTokens: 4096, outputFormat: "text" as const,
});

const tool = (settings: Record<string, string | number | boolean> = {}, mapping: Record<string, string> = {}) => ({
  settings, inputMapping: mapping,
});

export const mockWorkflows: Workflow[] = [
  {
    id: "wf-contract-review",
    name: "Contract Review Chain",
    description: "Extract key terms from a contract, then assess risk and generate a summary.",
    tags: ["legal", "analysis"],
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-20T14:30:00Z",
    nodes: [
      { id: "n1", type: "input", label: "Contract Upload", position: { x: 50, y: 200 }, config: tool(), status: "idle" },
      { id: "n2", type: "file_reader", label: "Parse Document", position: { x: 300, y: 200 }, config: tool({ format: "pdf" }), status: "idle" },
      { id: "n3", type: "llm", label: "Extract Key Terms", position: { x: 550, y: 100 }, config: llm("openai", "gpt-4o", "You are a legal analyst.", "Extract all key terms, obligations, and deadlines from:\n\n{{input}}"), status: "idle" },
      { id: "n4", type: "llm", label: "Risk Assessment", position: { x: 550, y: 300 }, config: llm("anthropic", "claude-sonnet-4-20250514", "You are a contract risk analyst.", "Assess risk level for each clause:\n\n{{input}}"), status: "idle" },
      { id: "n5", type: "llm", label: "Generate Summary", position: { x: 800, y: 200 }, config: llm("openai", "gpt-4o", "Summarize the contract review.", "Combine the key terms and risk analysis into an executive summary:\n\nTerms: {{n3.output}}\nRisks: {{n4.output}}"), status: "idle" },
      { id: "n6", type: "output", label: "Review Report", position: { x: 1050, y: 200 }, config: tool(), status: "idle" },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n4", target: "n5" },
      { id: "e6", source: "n5", target: "n6" },
    ],
  },
  {
    id: "wf-prd-to-eng",
    name: "PRD to Engineering Plan",
    description: "Convert a product requirements document into a technical engineering plan with task breakdown.",
    tags: ["engineering", "planning"],
    createdAt: "2026-06-12T10:00:00Z",
    updatedAt: "2026-06-19T16:00:00Z",
    nodes: [
      { id: "n1", type: "input", label: "PRD Input", position: { x: 50, y: 200 }, config: tool(), status: "idle" },
      { id: "n2", type: "llm", label: "Parse Requirements", position: { x: 300, y: 200 }, config: llm("anthropic", "claude-sonnet-4-20250514", "You are a senior PM.", "Break this PRD into discrete requirements:\n\n{{input}}"), status: "idle" },
      { id: "n3", type: "llm", label: "Architecture Design", position: { x: 550, y: 100 }, config: llm("openai", "gpt-4o", "You are a staff engineer.", "Design the system architecture for:\n\n{{n2.output}}"), status: "idle" },
      { id: "n4", type: "llm", label: "Task Breakdown", position: { x: 550, y: 300 }, config: llm("google", "gemini-2.5-pro", "You are a tech lead.", "Create a task breakdown with estimates:\n\n{{n2.output}}"), status: "idle" },
      { id: "n5", type: "llm", label: "Compile Plan", position: { x: 800, y: 200 }, config: llm("anthropic", "claude-sonnet-4-20250514", "Compile the final eng plan.", "Architecture:\n{{n3.output}}\n\nTasks:\n{{n4.output}}"), status: "idle" },
      { id: "n6", type: "output", label: "Engineering Plan", position: { x: 1050, y: 200 }, config: tool(), status: "idle" },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n2", target: "n4" },
      { id: "e4", source: "n3", target: "n5" },
      { id: "e5", source: "n4", target: "n5" },
      { id: "e6", source: "n5", target: "n6" },
    ],
  },
  {
    id: "wf-gh-code-review",
    name: "GitHub Code Review",
    description: "Fetch a PR diff from GitHub, run LLM code review, and post feedback.",
    tags: ["developer_tools", "code_review"],
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-21T11:00:00Z",
    nodes: [
      { id: "n1", type: "input", label: "PR URL", position: { x: 50, y: 200 }, config: tool(), status: "idle" },
      { id: "n2", type: "github", label: "Fetch PR Diff", position: { x: 300, y: 200 }, config: tool({ action: "get_pr_diff" }, { pr_url: "n1.output" }), status: "idle" },
      { id: "n3", type: "llm", label: "Review Code", position: { x: 550, y: 200 }, config: llm("anthropic", "claude-sonnet-4-20250514", "You are a senior code reviewer. Be concise and constructive.", "Review this PR diff for bugs, style issues, and improvements:\n\n{{n2.output}}"), status: "idle" },
      { id: "n4", type: "condition", label: "Has Issues?", position: { x: 800, y: 200 }, config: { field: "n3.output", operator: "contains" as const, value: "ISSUE:", trueBranch: "n5", falseBranch: "n6" }, status: "idle" },
      { id: "n5", type: "github", label: "Post Review Comment", position: { x: 1050, y: 100 }, config: tool({ action: "post_review" }, { body: "n3.output" }), status: "idle" },
      { id: "n6", type: "output", label: "LGTM", position: { x: 1050, y: 300 }, config: tool(), status: "idle" },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5", label: "true" },
      { id: "e5", source: "n4", target: "n6", label: "false" },
    ],
  },
  {
    id: "wf-research-brief",
    name: "Research Brief Builder",
    description: "Search the web for a topic, summarize findings, and produce a structured research brief.",
    tags: ["research", "content"],
    createdAt: "2026-06-18T12:00:00Z",
    updatedAt: "2026-06-21T09:00:00Z",
    nodes: [
      { id: "n1", type: "input", label: "Research Topic", position: { x: 50, y: 200 }, config: tool(), status: "idle" },
      { id: "n2", type: "web_search", label: "Web Search", position: { x: 300, y: 200 }, config: tool({ maxResults: 10 }, { query: "n1.output" }), status: "idle" },
      { id: "n3", type: "llm", label: "Summarize Sources", position: { x: 550, y: 200 }, config: llm("openai", "gpt-4o", "Summarize research sources objectively.", "Summarize the top findings from:\n\n{{n2.output}}"), status: "idle" },
      { id: "n4", type: "llm", label: "Draft Brief", position: { x: 800, y: 200 }, config: llm("mistral", "mistral-large-latest", "You are a research analyst.", "Write a structured research brief from:\n\n{{n3.output}}"), status: "idle" },
      { id: "n5", type: "human_approval", label: "Review Brief", position: { x: 1050, y: 200 }, config: tool({ instructions: "Review and approve the research brief before publishing." }), status: "idle" },
      { id: "n6", type: "file_writer", label: "Save Brief", position: { x: 1300, y: 200 }, config: tool({ filename: "research-brief.md", format: "markdown" }), status: "idle" },
      { id: "n7", type: "output", label: "Done", position: { x: 1550, y: 200 }, config: tool(), status: "idle" },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n3", target: "n4" },
      { id: "e4", source: "n4", target: "n5" },
      { id: "e5", source: "n5", target: "n6" },
      { id: "e6", source: "n6", target: "n7" },
    ],
  },
];

export const mockWorkflowSummaries: WorkflowSummary[] = mockWorkflows.map((w) => ({
  id: w.id,
  name: w.name,
  description: w.description,
  nodeCount: w.nodes.length,
  lastRunAt: w.id === "wf-contract-review" ? "2026-06-20T14:25:00Z" : w.id === "wf-gh-code-review" ? "2026-06-21T10:50:00Z" : null,
  lastRunStatus: w.id === "wf-contract-review" ? "completed" : w.id === "wf-gh-code-review" ? "completed" : null,
  updatedAt: w.updatedAt,
  tags: w.tags,
}));
