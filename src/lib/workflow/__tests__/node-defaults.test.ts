import { buildNodeData, type PaletteItem } from "../node-defaults";

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function makePaletteItem(nodeType: string, label = "Test", subtitle = "sub"): PaletteItem {
  return { nodeType, label, subtitle };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("buildNodeData", () => {
  it("returns label, subtitle, and colorKey from the palette item", () => {
    const data = buildNodeData(makePaletteItem("openai", "My Node", "GPT-4o"));
    expect(data.label).toBe("My Node");
    expect(data.subtitle).toBe("GPT-4o");
    expect(data.colorKey).toBe("openai");
  });

  it("sets status to idle by default", () => {
    const data = buildNodeData(makePaletteItem("openai"));
    expect(data.status).toBe("idle");
  });

  it("falls back gracefully for unknown node types", () => {
    const data = buildNodeData(makePaletteItem("unknown_type"));
    expect(data.label).toBe("Test");
    expect(data.status).toBe("idle");
  });
});

describe("LLM node defaults", () => {
  const llmTypes = ["openai", "anthropic", "google", "mistral", "openrouter", "custom"] as const;

  it.each(llmTypes)("%s has provider, model, temperature, and maxTokens", (nodeType) => {
    const data = buildNodeData(makePaletteItem(nodeType));
    const config = data.config as Record<string, unknown>;
    expect(config).toBeDefined();
    expect(config.provider).toBe(nodeType);
    expect(typeof config.model).toBe("string");
    expect(config.temperature).toBe(0.7);
    expect(config.maxTokens).toBe(4096);
  });

  it("openai defaults to gpt-4o", () => {
    const config = buildNodeData(makePaletteItem("openai")).config as Record<string, unknown>;
    expect(config.model).toBe("gpt-4o");
  });

  it("anthropic defaults to claude-sonnet-4", () => {
    const config = buildNodeData(makePaletteItem("anthropic")).config as Record<string, unknown>;
    expect(config.model).toBe("claude-sonnet-4");
  });

  it("google defaults to gemini-2.5-pro", () => {
    const config = buildNodeData(makePaletteItem("google")).config as Record<string, unknown>;
    expect(config.model).toBe("gemini-2.5-pro");
  });
});

describe("Tool node defaults", () => {
  it("file_reader has source and filePath config", () => {
    const config = buildNodeData(makePaletteItem("file_reader")).config as Record<string, unknown>;
    expect(config.source).toBe("upload");
    expect(config.filePath).toBe("");
  });

  it("file_writer has destination and format config", () => {
    const config = buildNodeData(makePaletteItem("file_writer")).config as Record<string, unknown>;
    expect(config.destination).toBe("download");
    expect(config.format).toBe("text");
  });

  it("github has operation, repo, branch config", () => {
    const config = buildNodeData(makePaletteItem("github")).config as Record<string, unknown>;
    expect(config.operation).toBe("read_file");
    expect(config.branch).toBe("main");
  });

  it("http_api has method and url config", () => {
    const config = buildNodeData(makePaletteItem("http_api")).config as Record<string, unknown>;
    expect(config.method).toBe("GET");
  });

  it("code_executor has language config", () => {
    const config = buildNodeData(makePaletteItem("code_executor")).config as Record<string, unknown>;
    expect(config.language).toBe("javascript");
  });
});

describe("Logic node defaults", () => {
  it("condition has field, operator, value, trueBranch, falseBranch", () => {
    const config = buildNodeData(makePaletteItem("condition")).config as Record<string, unknown>;
    expect(config.operator).toBe("equals");
    expect(config.trueBranch).toBe("");
    expect(config.falseBranch).toBe("");
  });

  it("human_approval has prompt config", () => {
    const config = buildNodeData(makePaletteItem("human_approval")).config as Record<string, unknown>;
    expect(config.prompt).toBe("Approve to continue?");
  });

  it("output has format config", () => {
    const config = buildNodeData(makePaletteItem("output")).config as Record<string, unknown>;
    expect(config.format).toBe("json");
  });

  it("input has source config", () => {
    const config = buildNodeData(makePaletteItem("input")).config as Record<string, unknown>;
    expect(config.source).toBe("text");
  });
});

describe("All defined node types produce valid data", () => {
  const allTypes = [
    "openai", "anthropic", "google", "mistral", "openrouter", "custom",
    "file_reader", "file_writer", "github", "vercel", "database",
    "http_api", "web_search", "code_executor", "human_approval",
    "condition", "output", "input",
  ];

  it.each(allTypes)("%s produces data with label, subtitle, colorKey, status", (nodeType) => {
    const data = buildNodeData(makePaletteItem(nodeType, `Label-${nodeType}`, `Sub-${nodeType}`));
    expect(data.label).toBe(`Label-${nodeType}`);
    expect(data.subtitle).toBe(`Sub-${nodeType}`);
    expect(data.colorKey).toBe(nodeType);
    expect(data.status).toBe("idle");
  });
});
