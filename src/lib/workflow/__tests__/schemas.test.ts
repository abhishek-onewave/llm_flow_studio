import {
  llmNodeConfigSchema,
  toolNodeConfigSchema,
  conditionNodeConfigSchema,
  workflowEdgeSchema,
  workflowNodeSchema,
  workflowSchema,
} from "../schemas";

/* ------------------------------------------------------------------ */
/*  llmNodeConfigSchema                                                */
/* ------------------------------------------------------------------ */

describe("llmNodeConfigSchema", () => {
  const validLlmConfig = {
    provider: "openai",
    model: "gpt-4o",
    instructions: "Summarize the input.",
    promptTemplate: "{{input}}",
    temperature: 0.7,
    maxTokens: 4096,
    outputFormat: "text",
  };

  it("accepts a valid LLM config", () => {
    const result = llmNodeConfigSchema.safeParse(validLlmConfig);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid provider", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, provider: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects temperature above 2", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, temperature: 3 });
    expect(result.success).toBe(false);
  });

  it("rejects temperature below 0", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, temperature: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative maxTokens", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, maxTokens: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects maxTokens of 0", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, maxTokens: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects empty model string", () => {
    const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, model: "" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid providers", () => {
    for (const provider of ["openai", "anthropic", "google", "mistral", "openrouter", "custom"]) {
      const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, provider });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid output formats", () => {
    for (const outputFormat of ["text", "json", "markdown"]) {
      const result = llmNodeConfigSchema.safeParse({ ...validLlmConfig, outputFormat });
      expect(result.success).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  toolNodeConfigSchema                                               */
/* ------------------------------------------------------------------ */

describe("toolNodeConfigSchema", () => {
  it("accepts a valid tool config", () => {
    const result = toolNodeConfigSchema.safeParse({
      settings: { key: "value", count: 5, enabled: true },
      inputMapping: { input: "node-1.output" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty settings and inputMapping", () => {
    const result = toolNodeConfigSchema.safeParse({ settings: {}, inputMapping: {} });
    expect(result.success).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  conditionNodeConfigSchema                                          */
/* ------------------------------------------------------------------ */

describe("conditionNodeConfigSchema", () => {
  const validCondition = {
    field: "risk.severity",
    operator: "equals",
    value: "HIGH",
    trueBranch: "alert-node",
    falseBranch: "skip-node",
  };

  it("accepts a valid condition config", () => {
    const result = conditionNodeConfigSchema.safeParse(validCondition);
    expect(result.success).toBe(true);
  });

  it("accepts all valid operators", () => {
    for (const operator of ["equals", "contains", "gt", "lt", "exists", "regex"]) {
      const result = conditionNodeConfigSchema.safeParse({ ...validCondition, operator });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid operator", () => {
    const result = conditionNodeConfigSchema.safeParse({ ...validCondition, operator: "nope" });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  workflowEdgeSchema                                                 */
/* ------------------------------------------------------------------ */

describe("workflowEdgeSchema", () => {
  it("accepts a valid edge", () => {
    const result = workflowEdgeSchema.safeParse({
      id: "e1-2",
      source: "n1",
      target: "n2",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional sourceHandle and targetHandle", () => {
    const result = workflowEdgeSchema.safeParse({
      id: "e1-2",
      source: "n1",
      target: "n2",
      sourceHandle: "out-1",
      targetHandle: "in-1",
      label: "yes",
    });
    expect(result.success).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  workflowNodeSchema                                                 */
/* ------------------------------------------------------------------ */

describe("workflowNodeSchema", () => {
  it("accepts a valid LLM workflow node", () => {
    const result = workflowNodeSchema.safeParse({
      id: "n1",
      type: "llm",
      label: "Summarizer",
      position: { x: 100, y: 200 },
      config: {
        provider: "openai",
        model: "gpt-4o",
        instructions: "",
        promptTemplate: "{{input}}",
        temperature: 0.7,
        maxTokens: 4096,
        outputFormat: "text",
      },
      status: "idle",
    });
    expect(result.success).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  workflowSchema                                                     */
/* ------------------------------------------------------------------ */

describe("workflowSchema", () => {
  it("accepts a complete workflow document", () => {
    const result = workflowSchema.safeParse({
      id: "wf-1",
      name: "Contract Analyzer",
      description: "Analyzes contracts for risk.",
      nodes: [
        {
          id: "n1",
          type: "input",
          label: "Input",
          position: { x: 0, y: 0 },
          config: { settings: {}, inputMapping: {} },
          status: "idle",
        },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2" }],
      createdAt: "2025-06-21T00:00:00Z",
      updatedAt: "2025-06-21T00:00:00Z",
      tags: ["contract", "risk"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects workflow with empty name", () => {
    const result = workflowSchema.safeParse({
      id: "wf-1",
      name: "",
      description: "",
      nodes: [],
      edges: [],
      createdAt: "2025-06-21T00:00:00Z",
      updatedAt: "2025-06-21T00:00:00Z",
      tags: [],
    });
    expect(result.success).toBe(false);
  });
});
