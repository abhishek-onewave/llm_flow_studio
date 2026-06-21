import type { LLMProvider } from "./workflow";

/** A model provider (e.g. OpenAI, Anthropic) */
export interface ModelProvider {
  id: LLMProvider;
  name: string;
  description: string;
  iconSlug: string;
  website: string;
  isConfigured: boolean;
  modelCount: number;
}

/** A single model within a provider */
export interface ModelRecord {
  id: string;
  provider: LLMProvider;
  name: string;
  displayName: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  inputPricePer1k: number;
  outputPricePer1k: number;
  capabilities: ModelCapability[];
  isDefault: boolean;
}

export type ModelCapability =
  | "text"
  | "vision"
  | "function_calling"
  | "json_mode"
  | "streaming"
  | "code";
