/**
 * Real workflow execution engine.
 *
 * LLM nodes call /api/llm with streaming. Non-LLM nodes use mock behavior.
 */

import { useWorkflowStore } from "./store";
import { topoSort, getDownstream } from "./mock-runner";
import type { WorkflowNode } from "@/components/workflow/canvas-node";

const LLM_TYPES = new Set(["openai", "anthropic", "google", "mistral", "openrouter", "custom"]);
const IMAGE_GEN_TYPES = new Set(["openai_image", "google_image"]);

const NON_LLM_OUTPUTS: Record<string, string> = {
  file_reader: `[Document parsed successfully]\nContent extracted and ready for processing.`,
  output: `Workflow output collected.`,
  input: `Input received.`,
  _default: `Node executed successfully.`,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let eventCounter = 0;
/** Tracks condition node results for branch routing */
const conditionResults = new Map<string, boolean>();

/** Check if a node should be skipped due to condition branch routing */
function shouldSkipForCondition(nodeId: string): boolean {
  const { edges } = useWorkflowStore.getState();
  const incomingEdges = edges.filter((e) => e.target === nodeId);
  for (const edge of incomingEdges) {
    if (conditionResults.has(edge.source)) {
      const result = conditionResults.get(edge.source)!;
      const handle = edge.sourceHandle;
      if (handle === "true" && !result) return true;
      if (handle === "false" && result) return true;
    }
  }
  return false;
}

function emitEvent(
  nodeId: string,
  nodeLabel: string,
  type: "started" | "output_chunk" | "completed" | "error" | "skipped",
  message: string,
  stats?: { tokens?: number; durationMs?: number; cost?: number },
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
    ...stats,
  });
}

/** Get upstream node outputs for a given node */
function getUpstreamOutputs(nodeId: string): string {
  const { edges, nodes, nodeOutputs } = useWorkflowStore.getState();
  const upstreamEdges = edges.filter((e) => e.target === nodeId);
  const parts: string[] = [];

  for (const edge of upstreamEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const output = nodeOutputs[edge.source];
    if (output) {
      parts.push(output);
    } else if (sourceNode) {
      parts.push(`[No output from ${sourceNode.data.label}]`);
    }
  }

  return parts.join("\n\n---\n\n");
}

/** Build the prompt from template + upstream outputs */
function buildPrompt(node: WorkflowNode): string {
  const config = (node.data as Record<string, unknown>).config as Record<string, unknown> | undefined;
  const template = (config?.promptTemplate as string) || "{{input}}";
  const upstreamOutput = getUpstreamOutputs(node.id);

  return template
    .replace(/\{\{input\}\}/g, upstreamOutput)
    .replace(/\{\{previous\.output\.text\}\}/g, upstreamOutput)
    .replace(/\{\{workflow\.input\}\}/g, upstreamOutput);
}

/* ------------------------------------------------------------------ */
/*  Execute a single LLM node via /api/llm                            */
/* ------------------------------------------------------------------ */

async function executeLLMNode(
  node: WorkflowNode,
  signal: AbortSignal,
  workspaceId: string,
): Promise<boolean> {
  const { setNodeStatus } = useWorkflowStore.getState();
  const config = (node.data as Record<string, unknown>).config as Record<string, unknown> | undefined;
  const provider = (config?.provider as string) || node.data.colorKey;
  const model = (config?.model as string) || "";
  const instructions = (config?.instructions as string) || "";
  const temperature = (config?.temperature as number) ?? 0.7;
  const maxTokens = (config?.maxTokens as number) ?? 4096;

  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", `Calling ${provider}/${model}...`);

  const prompt = buildPrompt(node);
  const messages: { role: string; content: string }[] = [];
  if (instructions) messages.push({ role: "system", content: instructions });
  messages.push({ role: "user", content: prompt });

  const startTime = Date.now();

  try {
    const res = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, messages, temperature, maxTokens, workspaceId }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }

    // Stream the response
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal.aborted) { reader.cancel(); return false; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          // Usage info
          if (parsed.usage) {
            totalTokens = (parsed.usage.prompt_tokens || 0) + (parsed.usage.completion_tokens || 0);
          }
          // Content chunk
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            useWorkflowStore.setState((s) => ({
              nodeOutputs: { ...s.nodeOutputs, [node.id]: fullText },
            }));
          }
          // OpenAI includes usage in final chunk
          if (parsed.usage && !totalTokens) {
            totalTokens = (parsed.usage.prompt_tokens || 0) + (parsed.usage.completion_tokens || 0);
          }
        } catch {
          // Skip unparseable
        }
      }

      // Pause check
      while (useWorkflowStore.getState().runStatus === "queued") {
        await sleep(100);
        if (signal.aborted) return false;
      }
    }

    // Ensure final output is set
    useWorkflowStore.setState((s) => ({
      nodeOutputs: { ...s.nodeOutputs, [node.id]: fullText },
    }));

    const durationMs = Date.now() - startTime;
    const estimatedCost = totalTokens * 0.000003; // rough estimate

    setNodeStatus(node.id, "completed");
    emitEvent(
      node.id,
      node.data.label,
      "completed",
      `Completed in ${(durationMs / 1000).toFixed(1)}s. ${totalTokens > 0 ? `${totalTokens.toLocaleString()} tokens` : "tokens N/A"}, ~$${estimatedCost.toFixed(4)}.`,
      { tokens: totalTokens, durationMs, cost: estimatedCost },
    );

    return true;
  } catch (err) {
    if (signal.aborted) return false;
    const message = err instanceof Error ? err.message : "Unknown error";
    setNodeStatus(node.id, "error");
    emitEvent(node.id, node.data.label, "error", `Error: ${message}`);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Execute a non-LLM node (mock)                                     */
/* ------------------------------------------------------------------ */

async function executeNonLLMNode(
  node: WorkflowNode,
  signal: AbortSignal,
): Promise<boolean> {
  const { setNodeStatus } = useWorkflowStore.getState();
  const colorKey = node.data.colorKey;

  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", `Executing ${node.data.label}...`);

  await sleep(500);
  if (signal.aborted) return false;

  // For input nodes, use configured text/file content
  let output: string;
  if (colorKey === "input") {
    const config = (node.data as Record<string, unknown>).config as Record<string, unknown> | undefined;
    const inputMode = (config?.inputMode as string) || "text";
    const inputText = (config?.inputText as string) || "";
    const inputFileContent = (config?.inputFileContent as string) || "";
    const inputFileName = (config?.inputFileName as string) || "";

    if (inputMode === "file" && inputFileContent) {
      output = inputFileContent.startsWith("data:")
        ? `[file:${inputFileName}]\n${inputFileContent}`
        : inputFileContent;
    } else if (inputText) {
      output = inputText;
    } else {
      const upstream = getUpstreamOutputs(node.id);
      output = upstream || "Input received.";
    }
  } else if (colorKey === "output") {
    const upstream = getUpstreamOutputs(node.id);
    output = upstream || (NON_LLM_OUTPUTS[colorKey] ?? NON_LLM_OUTPUTS._default);
  } else {
    output = NON_LLM_OUTPUTS[colorKey] ?? NON_LLM_OUTPUTS._default;
  }

  useWorkflowStore.setState((s) => ({
    nodeOutputs: { ...s.nodeOutputs, [node.id]: output },
  }));

  setNodeStatus(node.id, "completed");
  emitEvent(node.id, node.data.label, "completed", `Completed.`, { durationMs: 500 });

  await sleep(200);
  return true;
}

/* ------------------------------------------------------------------ */
/*  Execute a condition node                                           */
/* ------------------------------------------------------------------ */

async function executeConditionNode(
  node: WorkflowNode,
  signal: AbortSignal,
): Promise<boolean> {
  const { setNodeStatus } = useWorkflowStore.getState();
  const config = (node.data as Record<string, unknown>).config as Record<string, unknown> | undefined;
  const conditionType = (config?.conditionType as string) || "not_empty";
  const conditionValue = (config?.conditionValue as string) || "";

  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", `Evaluating condition (${conditionType})...`);

  await sleep(300);
  if (signal.aborted) return false;

  const upstream = getUpstreamOutputs(node.id);
  let result = false;

  switch (conditionType) {
    case "contains":
      result = upstream.includes(conditionValue);
      break;
    case "not_contains":
      result = !upstream.includes(conditionValue);
      break;
    case "equals":
      result = upstream.trim() === conditionValue.trim();
      break;
    case "not_empty":
      result = upstream.trim().length > 0;
      break;
    case "regex":
      try {
        result = new RegExp(conditionValue).test(upstream);
      } catch {
        emitEvent(node.id, node.data.label, "error", `Invalid regex: ${conditionValue}`);
        setNodeStatus(node.id, "error");
        return false;
      }
      break;
  }

  // Store both the output and the branch result for downstream routing
  const output = result ? upstream : "[condition:false]";
  useWorkflowStore.setState((s) => ({
    nodeOutputs: { ...s.nodeOutputs, [node.id]: output },
  }));
  // Track which branch is active for this condition node
  conditionResults.set(node.id, result);

  setNodeStatus(node.id, "completed");
  emitEvent(
    node.id,
    node.data.label,
    "completed",
    `Condition evaluated: ${result ? "TRUE — passing output through" : "FALSE — output blocked"}.`,
  );

  return true;
}

/* ------------------------------------------------------------------ */
/*  Execute a human approval node                                      */
/* ------------------------------------------------------------------ */

async function executeHumanApprovalNode(
  node: WorkflowNode,
  signal: AbortSignal,
): Promise<boolean> {
  const { setNodeStatus, requestApproval } = useWorkflowStore.getState();

  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", "Waiting for human approval...");

  // Request approval — UI will show approve/reject buttons
  requestApproval(node.id, node.data.label);

  // Poll until approval result is set or abort
  while (true) {
    if (signal.aborted) return false;

    const { approvalResult } = useWorkflowStore.getState();
    if (approvalResult === "approved") {
      const upstream = getUpstreamOutputs(node.id);
      useWorkflowStore.setState((s) => ({
        nodeOutputs: { ...s.nodeOutputs, [node.id]: upstream || "Approved." },
      }));
      setNodeStatus(node.id, "completed");
      emitEvent(node.id, node.data.label, "completed", "Approved — continuing workflow.");
      return true;
    }
    if (approvalResult === "rejected") {
      setNodeStatus(node.id, "error");
      emitEvent(node.id, node.data.label, "error", "Rejected — workflow stopped.");
      return false;
    }

    await sleep(200);
  }
}

/* ------------------------------------------------------------------ */
/*  Execute an image generation node via /api/image                    */
/* ------------------------------------------------------------------ */

async function executeImageNode(
  node: WorkflowNode,
  signal: AbortSignal,
  workspaceId: string,
): Promise<boolean> {
  const { setNodeStatus } = useWorkflowStore.getState();
  const config = (node.data as Record<string, unknown>).config as Record<string, unknown> | undefined;
  const provider = (config?.provider as string) || (node.data.colorKey === "google_image" ? "google" : "openai");
  let model = (config?.model as string) || (provider === "google" ? "gemini-2.5-flash-image" : "dall-e-3");
  // Migrate deprecated model names
  if (model === "gemini-2.0-flash-preview-image-generation") {
    model = "gemini-2.5-flash-image";
  }
  const size = (config?.size as string) || "1024x1024";
  const quality = (config?.quality as string) || "standard";

  setNodeStatus(node.id, "running");
  emitEvent(node.id, node.data.label, "started", `Generating image with ${provider}/${model}...`);

  const prompt = buildPrompt(node);
  const startTime = Date.now();

  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model, prompt, size, quality, workspaceId }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const imageUrl = (data as { url?: string }).url;
    if (!imageUrl) throw new Error("No image URL returned");

    const output = `[image:${imageUrl}]`;
    useWorkflowStore.setState((s) => ({
      nodeOutputs: { ...s.nodeOutputs, [node.id]: output },
    }));

    const durationMs = Date.now() - startTime;
    setNodeStatus(node.id, "completed");
    emitEvent(node.id, node.data.label, "completed", `Image generated in ${(durationMs / 1000).toFixed(1)}s.`, { durationMs });

    return true;
  } catch (err) {
    if (signal.aborted) return false;
    const message = err instanceof Error ? err.message : "Unknown error";
    setNodeStatus(node.id, "error");
    emitEvent(node.id, node.data.label, "error", `Error: ${message}`);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Execute a single node (dispatch)                                   */
/* ------------------------------------------------------------------ */

async function executeSingleNodeReal(
  node: WorkflowNode,
  signal: AbortSignal,
  workspaceId: string,
): Promise<boolean> {
  if (IMAGE_GEN_TYPES.has(node.data.colorKey)) {
    return executeImageNode(node, signal, workspaceId);
  }
  if (LLM_TYPES.has(node.data.colorKey)) {
    return executeLLMNode(node, signal, workspaceId);
  }
  if (node.data.colorKey === "condition") {
    return executeConditionNode(node, signal);
  }
  if (node.data.colorKey === "human_approval") {
    return executeHumanApprovalNode(node, signal);
  }
  return executeNonLLMNode(node, signal);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

let currentAbort: AbortController | null = null;
let activeWorkspaceId: string = "";

/** Set the workspace ID for API key lookups */
export function setWorkspaceId(id: string) {
  activeWorkspaceId = id;
}

export async function runWorkflow(): Promise<void> {
  const store = useWorkflowStore.getState();
  if (store.runStatus === "running") return;

  currentAbort?.abort();
  const abort = new AbortController();
  currentAbort = abort;

  const { nodes, edges, setNodeStatus } = store;

  useWorkflowStore.setState({ runEvents: [], runStatus: "running", nodeOutputs: {} });

  const order = topoSort(nodes, edges);
  for (const id of order) setNodeStatus(id, "idle");
  for (const id of order) setNodeStatus(id, "queued");

  conditionResults.clear();
  emitEvent("workflow", "Workflow", "started", "Workflow execution started.");

  for (const id of order) {
    if (abort.signal.aborted) break;

    while (useWorkflowStore.getState().runStatus === "queued") {
      await sleep(100);
      if (abort.signal.aborted) break;
    }
    if (abort.signal.aborted) break;

    const node = useWorkflowStore.getState().nodes.find((n) => n.id === id);
    if (!node) continue;

    // Skip nodes on inactive condition branches
    if (shouldSkipForCondition(id)) {
      setNodeStatus(id, "skipped");
      emitEvent(id, node.data.label, "skipped", "Skipped — condition branch not taken.");
      continue;
    }

    const ok = await executeSingleNodeReal(node, abort.signal, activeWorkspaceId);
    if (!ok) break;
  }

  if (abort.signal.aborted) {
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

  await executeSingleNodeReal(node, abort.signal, activeWorkspaceId);

  if (!abort.signal.aborted) {
    useWorkflowStore.setState({ runStatus: "idle" });
  }
}

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

    const ok = await executeSingleNodeReal(node, abort.signal, activeWorkspaceId);
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

export { pauseRun, resumeRun, stopRun } from "./mock-runner";
